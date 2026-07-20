// ============================================================
// src/entities/medicine.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { MedicineCategory } from './enums';
import { Supplier } from './supplier.entity';
import { PrescriptionMedicine } from './prescription-medicine.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('medicines')
export class Medicine extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'generic_name' })
  genericName: string;

  @Column({ type: 'varchar',  name: 'brand_name', nullable: true })
  brandName: string | null;

  @Column({ type: 'enum', enum: MedicineCategory })
  category: MedicineCategory;

  @Column({ type: 'varchar',  nullable: true })
  manufacturer: string | null;

  @Column()
  unit: string; // mg, ml, piece

  @Column({ type: 'varchar',  nullable: true })
  strength: string | null; // "500mg"

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'int', default: 10, name: 'reorder_level' })
  reorderLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'selling_price' })
  sellingPrice: number;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate: Date | null;

  @Column({ type: 'varchar',  name: 'batch_number', nullable: true })
  batchNumber: string | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.medicines, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier | null;

  @Column({ type: 'varchar',  name: 'supplier_id', nullable: true })
  supplierId: string | null;

  @OneToMany(() => PrescriptionMedicine, (pm) => pm.medicine)
  prescriptionMedicines: PrescriptionMedicine[];

  @OneToMany(() => InvoiceItem, (item) => item.medicine)
  invoiceItems: InvoiceItem[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
