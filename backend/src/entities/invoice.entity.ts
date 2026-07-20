// ============================================================
// src/entities/invoice.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { InvoiceType, InvoiceStatus } from './enums';
import { Patient } from './patient.entity';
import { Admission } from './admission.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ unique: true, name: 'invoice_no' })
  invoiceNo: string; // INV-2026-001

  @ManyToOne(() => Patient, (patient) => patient.invoices)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Admission, (adm) => adm.invoices, { nullable: true })
  @JoinColumn({ name: 'admission_id' })
  admission: Admission | null;

  @Column({ type: 'varchar',  name: 'admission_id', nullable: true })
  admissionId: string | null;

  @Column({ type: 'enum', enum: InvoiceType, name: 'invoice_type' })
  invoiceType: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'varchar',  name: 'discount_reason', nullable: true })
  discountReason: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'due_amount' })
  dueAmount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @Column({ name: 'created_by_id' })
  createdById: string;
}
