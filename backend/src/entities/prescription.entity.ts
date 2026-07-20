// ============================================================
// src/entities/prescription.entity.ts
// ============================================================
import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Appointment } from './appointment.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { PrescriptionMedicine } from './prescription-medicine.entity';

@Entity('prescriptions')
export class Prescription extends BaseEntity {
  @Column({ unique: true, name: 'prescription_no' })
  prescriptionNo: string; // PRX-2026-001

  @OneToOne(() => Appointment, (apt) => apt.prescription, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment | null;

  @Column({ type: 'varchar',  name: 'appointment_id', nullable: true })
  appointmentId: string | null;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.prescriptions)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text', nullable: true, name: 'chief_complaint' })
  chiefComplaint: string | null;

  @Column({ type: 'text', nullable: true })
  advice: string | null;

  @Column({ type: 'date', nullable: true, name: 'follow_up_date' })
  followUpDate: Date | null;

  @OneToMany(() => PrescriptionMedicine, (pm) => pm.prescription, { cascade: true })
  medicines: PrescriptionMedicine[];
}
