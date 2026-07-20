// ============================================================
// src/entities/refresh-token.entity.ts
// Refresh-token rotation + reuse detection (spec: JWT refresh 7d)
// ============================================================
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Hashed token value (never store raw refresh tokens) */
  @Column()
  tokenHash: string;

  /** Token family — all tokens from one login share a family id.
   *  On reuse of an already-rotated token, the ENTIRE family is revoked. */
  @Index()
  @Column()
  familyId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'varchar',  name: 'replaced_by_id', nullable: true })
  replacedById: string | null;
}
