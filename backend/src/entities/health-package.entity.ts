// ============================================================
// src/entities/health-package.entity.ts
// ============================================================
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('health_packages')
export class HealthPackage extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar',  name: 'name_bn', nullable: true })
  nameBn: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('simple-array', { name: 'tests_included' })
  testsIncluded: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
