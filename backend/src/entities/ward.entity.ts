// ============================================================
// src/entities/ward.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { WardType } from './enums';
import { Department } from './department.entity';
import { Bed } from './bed.entity';
import { Staff } from './staff.entity';

@Entity('wards')
export class Ward extends BaseEntity {
  @Column()
  name: string; // e.g., "General Ward A"

  @Column({ type: 'enum', enum: WardType, name: 'ward_type' })
  wardType: WardType;

  @ManyToOne(() => Department, (dept) => dept.wards)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'department_id' })
  departmentId: string;

  @Column({ type: 'int', name: 'floor_number' })
  floorNumber: number;

  @OneToMany(() => Bed, (bed) => bed.ward)
  beds: Bed[];

  @OneToMany(() => Staff, (staff) => staff.ward)
  staff: Staff[];
}
