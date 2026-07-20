// ============================================================
// src/entities/patient.entity.ts
// ============================================================
import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Gender, BloodGroup } from './enums';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { Admission } from './admission.entity';
import { Prescription } from './prescription.entity';
import { LabTest } from './lab-test.entity';
import { Invoice } from './invoice.entity';

@Entity('patients')
export class Patient extends BaseEntity {
  @OneToOne(() => User, (user) => user.patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar',  name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ unique: true, name: 'patient_id' })
  patientId: string; // e.g., PAT-2026-00001

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar',  name: 'full_name_bn', nullable: true })
  fullNameBn: string | null;

  @Column()
  phone: string;

  @Column({ type: 'varchar',  nullable: true })
  email: string | null;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: BloodGroup, nullable: true })
  bloodGroup: BloodGroup | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar',  name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string | null;

  @Column({ type: 'varchar',  name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string | null;

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column('simple-array', { nullable: true, name: 'chronic_diseases' })
  chronicDiseases: string[];

  @Column('simple-array', { nullable: true, name: 'current_medications' })
  currentMedications: string[];

  @OneToMany(() => Appointment, (apt) => apt.patient)
  appointments: Appointment[];

  @OneToMany(() => Admission, (adm) => adm.patient)
  admissions: Admission[];

  @OneToMany(() => Prescription, (rx) => rx.patient)
  prescriptions: Prescription[];

  @OneToMany(() => LabTest, (test) => test.patient)
  labTests: LabTest[];

  @OneToMany(() => Invoice, (inv) => inv.patient)
  invoices: Invoice[];
}
