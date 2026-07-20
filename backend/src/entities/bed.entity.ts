// ============================================================
// src/entities/bed.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BedType, BedStatus } from './enums';
import { Ward } from './ward.entity';
import { Admission } from './admission.entity';

@Entity('beds')
export class Bed extends BaseEntity {
  @Column({ name: 'bed_number' })
  bedNumber: string; // e.g., "A-01"

  @ManyToOne(() => Ward, (ward) => ward.beds)
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  @Column({ name: 'ward_id' })
  wardId: string;

  @Column({ type: 'enum', enum: BedType, name: 'bed_type' })
  bedType: BedType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'daily_rent' })
  dailyRent: number;

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status: BedStatus;

  @OneToMany(() => Admission, (adm) => adm.bed)
  admissions: Admission[];
}
