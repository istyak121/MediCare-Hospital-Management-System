// ============================================================
// src/entities/prescription-medicine.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Prescription } from './prescription.entity';
import { Medicine } from './medicine.entity';

@Entity('prescription_medicines')
export class PrescriptionMedicine extends BaseEntity {
  @ManyToOne(() => Prescription, (rx) => rx.medicines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @ManyToOne(() => Medicine, (med) => med.prescriptionMedicines)
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column({ name: 'medicine_id' })
  medicineId: string;

  @Column() // e.g., "1-0-1"
  dosage: string;

  @Column() // e.g., "7 days"
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'int' })
  quantity: number;
}
