// ============================================================
// src/entities/admission.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { AdmissionType, AdmissionStatus } from './enums';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Bed } from './bed.entity';
import { ProgressNote } from './progress-note.entity';
import { Invoice } from './invoice.entity';

@Entity('admissions')
export class Admission extends BaseEntity {
  @Column({ unique: true, name: 'admission_no' })
  admissionNo: string; // ADM-2026-001

  @ManyToOne(() => Patient, (patient) => patient.admissions)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.admissions)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => Bed, (bed) => bed.admissions)
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @Column({ name: 'bed_id' })
  bedId: string;

  @Column({ name: 'admission_date', type: 'timestamptz' })
  admissionDate: Date;

  @Column({ name: 'discharge_date', type: 'timestamptz', nullable: true })
  dischargeDate: Date | null;

  @Column({ type: 'enum', enum: AdmissionType, name: 'admission_type' })
  admissionType: AdmissionType;

  @Column({ type: 'enum', enum: AdmissionStatus, default: AdmissionStatus.ACTIVE })
  status: AdmissionStatus;

  @Column({ type: 'text', nullable: true })
  diagnosis: string | null;

  @Column('simple-array', { nullable: true })
  symptoms: string[];

  @OneToMany(() => ProgressNote, (note) => note.admission)
  progressNotes: ProgressNote[];

  @OneToMany(() => Invoice, (inv) => inv.admission)
  invoices: Invoice[];
}
