// ============================================================
// src/entities/audit-log.entity.ts
// Auto-populated by AuditSubscriber (Phase 1 common infra)
// ============================================================
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar',  name: 'user_id', nullable: true })
  userId: string | null;

  @Column()
  action: string; // PRESCRIPTION_CREATED, PATIENT_UPDATED

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_data' })
  oldData: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
  newData: Record<string, any> | null;

  @Column({ type: 'varchar',  name: 'ip_address', nullable: true })
  ipAddress: string | null;
}
