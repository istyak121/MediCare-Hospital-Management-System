// ============================================================
// src/entities/doctor-schedule.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Staff } from './staff.entity';
import { Appointment } from './appointment.entity';

@Entity('doctor_schedules')
export class DoctorSchedule extends BaseEntity {
  @ManyToOne(() => Staff, (staff) => staff.schedules)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @Column({ type: 'int', name: 'day_of_week' }) // 0=Sunday, 6=Saturday
  dayOfWeek: number;

  @Column({ name: 'start_time' }) // "09:00" 24h format
  startTime: string;

  @Column({ name: 'end_time' }) // "17:00"
  endTime: string;

  @Column({ type: 'int', default: 20, name: 'slot_duration' }) // minutes
  slotDuration: number;

  @Column({ type: 'int', default: 1, name: 'max_patients' })
  maxPatients: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (apt) => apt.schedule)
  appointments: Appointment[];
}
