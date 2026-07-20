// ============================================================
// src/entities/lab-test.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { LabTestStatus } from './enums';
import { Patient } from './patient.entity';
import { LabTestType } from './lab-test-type.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('lab_tests')
export class LabTest extends BaseEntity {
  @Column({ unique: true, name: 'test_no' })
  testNo: string; // LAB-2026-001

  @ManyToOne(() => Patient, (patient) => patient.labTests)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'requested_by_id' })
  requestedById: string; // Doctor ID

  @ManyToOne(() => LabTestType, (type) => type.labTests)
  @JoinColumn({ name: 'test_type_id' })
  testType: LabTestType;

  @Column({ name: 'test_type_id' })
  testTypeId: string;

  @Column({ type: 'enum', enum: LabTestStatus, default: LabTestStatus.REQUESTED })
  status: LabTestStatus;

  @Column({ type: 'varchar',  name: 'sample_type', nullable: true })
  sampleType: string | null; // Blood, Urine, etc.

  @Column({ name: 'sample_collected_at', type: 'timestamptz', nullable: true })
  sampleCollectedAt: Date | null;

  @Column({ type: 'varchar',  name: 'collected_by_id', nullable: true })
  collectedById: string | null;

  @Column({ type: 'jsonb', nullable: true })
  results: Record<string, string> | null;

  @Column({ type: 'text', nullable: true, name: 'result_notes' })
  resultNotes: string | null;

  @Column({ type: 'varchar',  name: 'result_file_url', nullable: true })
  resultFileUrl: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'varchar',  name: 'completed_by_id', nullable: true })
  completedById: string | null;

  @OneToOne(() => InvoiceItem, (item) => item.labTest, { nullable: true })
  invoiceItem: InvoiceItem | null;
}
