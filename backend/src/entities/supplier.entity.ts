// ============================================================
// src/entities/supplier.entity.ts
// ============================================================
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Medicine } from './medicine.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar',  nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @OneToMany(() => Medicine, (med) => med.supplier)
  medicines: Medicine[];
}
