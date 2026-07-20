// ============================================================
// src/entities/payment.entity.ts
// ============================================================
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { PaymentMethod } from './enums';
import { Invoice } from './invoice.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Invoice, (inv) => inv.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar',  name: 'transaction_id', nullable: true })
  transactionId: string | null;

  @Column({ name: 'received_by_id' })
  receivedById: string;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
