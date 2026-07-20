// ============================================================
// src/entities/staff.entity.ts
// ============================================================
import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Gender } from './enums';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Ward } from './ward.entity';
import { DoctorSchedule } from './doctor-schedule.entity';
import { Appointment } from './appointment.entity';
import { Prescription } from './prescription.entity';
import { Admission } from './admission.entity';

@Entity('staff')
export class Staff extends BaseEntity {
  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar',  name: 'full_name_bn', nullable: true })
  fullNameBn: string | null;

  @Column()
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar',  name: 'photo_url', nullable: true })
  photoUrl: string | null;

  @Column({ unique: true, name: 'employee_id' })
  employeeId: string; // e.g., EMP-2026-001

  @Column()
  designation: string; // e.g., "Senior Consultant"

  @ManyToOne(() => Department, (dept) => dept.staff)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'department_id' })
  departmentId: string;

  // Doctor-specific fields
  @Column({ type: 'varchar',  nullable: true })
  specialization: string | null;

  @Column('simple-array', { nullable: true })
  qualifications: string[]; // ["MBBS", "MD (Cardiology)"]

  @Column({ type: 'int', nullable: true, name: 'experience_years' })
  experienceYears: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'consultation_fee' })
  consultationFee: number | null;

  // Nurse-specific
  @ManyToOne(() => Ward, (ward) => ward.staff, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward | null;

  @Column({ type: 'varchar',  name: 'ward_id', nullable: true })
  wardId: string | null;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules: DoctorSchedule[];

  @OneToMany(() => Appointment, (apt) => apt.doctor)
  appointments: Appointment[];

  @OneToMany(() => Prescription, (rx) => rx.doctor)
  prescriptions: Prescription[];

  @OneToMany(() => Admission, (adm) => adm.doctor)
  admissions: Admission[];
}
