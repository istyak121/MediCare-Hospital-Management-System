// ============================================================
// src/entities/user.entity.ts
// ============================================================
import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { UserRole } from './enums';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Notification } from './notification.entity';
import { AuditLog } from './audit-log.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // bcrypt hashed

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'preferred_language', default: 'en' })
  preferredLanguage: string; // 'en' | 'bn'

  // --- Hardened auth: account lockout (brute-force protection) ---
  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  // --- 2FA scaffold (TOTP flow implemented in Phase 6) ---
  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar',  name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string | null;

  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true, cascade: true })
  staff: Staff | null;

  @OneToOne(() => Patient, (patient) => patient.user, { nullable: true, cascade: true })
  patient: Patient | null;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];
}
