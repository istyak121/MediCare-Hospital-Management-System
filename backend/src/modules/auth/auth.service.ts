import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MIN = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMin = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${remainingMin} minutes.`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(user);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async refresh(refreshTokenValue: string) {
    // Hash the incoming token to find it in DB
    const tokenHash = this.hashToken(refreshTokenValue);
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isActive: true },
      relations: ['user'],
    });

    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');

    // Check if this token was already replaced (reuse detection)
    if (!storedToken.isActive || storedToken.revokedAt) {
      // Token reuse detected — revoke entire family (session hijacking attempt)
      await this.revokeTokenFamily(storedToken.familyId);
      throw new UnauthorizedException('Token reuse detected — family revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepo.remove(storedToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;
    if (!user.isActive) throw new UnauthorizedException('User deactivated');

    // Rotate: revoke old, create new
    const family = storedToken.familyId;
    await this.refreshTokenRepo.update(storedToken.id, {
      isActive: false,
      revokedAt: new Date(),
    });

    const tokens = await this.generateTokens(user, family);
    return tokens;
  }

  async logout(userId: string, refreshTokenValue?: string) {
    if (refreshTokenValue) {
      const tokenHash = this.hashToken(refreshTokenValue);
      await this.refreshTokenRepo.update(
        { tokenHash },
        { isActive: false, revokedAt: new Date() },
      );
    } else {
      // Revoke ALL refresh tokens for this user (full logout everywhere)
      await this.refreshTokenRepo.update(
        { userId, isActive: true },
        { isActive: false, revokedAt: new Date() },
      );
    }
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['staff', 'patient', 'staff.department'],
    });
  }

  // ---- Private helpers ----

  private async generateTokens(user: User, existingFamily?: string) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: 900 });

    const refreshPayload = { sub: user.id, email: user.email };
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: 604800 });

    // Decode refresh expiry to persist in DB
    const decodedRefresh: any = this.jwtService.decode(refreshToken);
    const expiresAt = new Date((decodedRefresh?.exp || 0) * 1000);

    const familyId = existingFamily || crypto.randomUUID();
    const tokenHash = this.hashToken(refreshToken);

    await this.refreshTokenRepo.save({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
      isActive: true,
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  private async recordFailedAttempt(user: User) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000);
      this.logger.warn(`User ${user.email} locked out for ${LOCKOUT_DURATION_MIN} minutes (${MAX_FAILED_ATTEMPTS} failed attempts)`);
    }
    await this.userRepo.save(user);
  }

  private async revokeTokenFamily(familyId: string) {
    await this.refreshTokenRepo.update(
      { familyId, isActive: true },
      { isActive: false, revokedAt: new Date() },
    );
    this.logger.warn(`Refresh token family ${familyId} revoked (reuse detected)`);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
