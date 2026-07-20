// ============================================================
// src/entities/vitals.entity.ts
// ============================================================
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Appointment } from './appointment.entity';

@Entity('vitals')
export class Vitals extends BaseEntity {
  @OneToOne(() => Appointment, (apt) => apt.vitals)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @Column({ name: 'recorded_by_id' })
  recordedById: string; // Nurse ID

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number | null; // Celsius

  @Column({ type: 'varchar', name: 'blood_pressure', nullable: true })
  bloodPressure: string | null; // "120/80"

  @Column({ type: 'int', nullable: true, name: 'pulse_rate' })
  pulseRate: number | null; // bpm

  @Column({ type: 'int', nullable: true, name: 'respiratory_rate' })
  respiratoryRate: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  spo2: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null; // kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number | null; // cm

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi: number | null;
}
