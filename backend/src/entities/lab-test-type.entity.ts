// ============================================================
// src/entities/lab-test-type.entity.ts
// ============================================================
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { LabTest } from './lab-test.entity';

@Entity('lab_test_types')
export class LabTestType extends BaseEntity {
  @Column()
  name: string; // Complete Blood Count (CBC)

  @Column({ type: 'varchar',  name: 'name_bn', nullable: true })
  nameBn: string | null;

  @Column()
  category: string; // Hematology, Biochemistry

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'normal_range' })
  normalRange: Record<string, { min: string; max: string; unit: string }> | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar',  name: 'turnaround_time', nullable: true })
  turnaroundTime: string | null; // "2 hours"

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => LabTest, (test) => test.testType)
  labTests: LabTest[];
}
