// ============================================================
// src/entities/department.entity.ts
// ============================================================
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Staff } from './staff.entity';
import { Ward } from './ward.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column()
  name: string; // e.g., "Cardiology"

  @Column({ type: 'varchar',  name: 'name_bn', nullable: true })
  nameBn: string | null; // Bengali name

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar',  nullable: true })
  icon: string | null; // Lucide icon name

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Staff, (staff) => staff.department)
  staff: Staff[];

  @OneToMany(() => Ward, (ward) => ward.department)
  wards: Ward[];
}
