// ============================================================
// src/entities/invoice-item.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ItemType } from './enums';
import { Invoice } from './invoice.entity';
import { Medicine } from './medicine.entity';
import { LabTest } from './lab-test.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ItemType, name: 'item_type' })
  itemType: ItemType;

  @ManyToOne(() => Medicine, (med) => med.invoiceItems, { nullable: true })
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine | null;

  @Column({ type: 'varchar',  name: 'medicine_id', nullable: true })
  medicineId: string | null;

  @OneToOne(() => LabTest, (test) => test.invoiceItem, { nullable: true })
  @JoinColumn({ name: 'lab_test_id' })
  labTest: LabTest | null;

  @Column({ type: 'varchar',  name: 'lab_test_id', nullable: true })
  labTestId: string | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;
}
