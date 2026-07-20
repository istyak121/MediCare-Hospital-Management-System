// ============================================================
// src/entities/appointment.entity.ts
// Concurrent slot locking enforced via partial unique index
// (see migrations: uq_appointment_slot_active)
// ============================================================
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { AppointmentType, AppointmentStatus } from './enums';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { DoctorSchedule } from './doctor-schedule.entity';
import { Vitals } from './vitals.entity';
import { Prescription } from './prescription.entity';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @Column({ unique: true, name: 'appointment_no' })
  appointmentNo: string; // APT-20260721-001

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => DoctorSchedule, (schedule) => schedule.appointments)
  @JoinColumn({ name: 'schedule_id' })
  schedule: DoctorSchedule;

  @Column({ name: 'schedule_id' })
  scheduleId: string;

  @Column({ type: 'date', name: 'appointment_date' })
  appointmentDate: Date;

  @Column({ name: 'time_slot' }) // "10:00-10:20"
  timeSlot: string;

  @Column({ type: 'enum', enum: AppointmentType, default: AppointmentType.OPD })
  type: AppointmentType;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true, name: 'chief_complaint' })
  chiefComplaint: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToOne(() => Vitals, (vitals) => vitals.appointment, { nullable: true })
  vitals: Vitals | null;

  @OneToOne(() => Prescription, (rx) => rx.appointment, { nullable: true })
  prescription: Prescription | null;
}
