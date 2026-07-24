import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceItem } from '../../entities/invoice-item.entity';
import { InvoiceStatus, InvoiceType, UserRole } from '../../entities/enums';
import { ItemType } from '../../entities/enums';
import { PaymentMethod } from '../../entities/enums';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice) private invRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private itemRepo: Repository<InvoiceItem>,
    @InjectRepository(Payment) private payRepo: Repository<Payment>,
  ) {}

  async findAll(status?: string, type?: string, page = 1, limit = 25, user?: any) {
    const qb = this.invRepo.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.patient', 'patient')
      .leftJoinAndSelect('inv.items', 'items')
      .leftJoinAndSelect('inv.payments', 'payments')
      .orderBy('inv.createdAt', 'DESC');

    if (user?.role === UserRole.PATIENT) {
      qb.andWhere('inv.patientId = :patientId', { patientId: user.patientId });
    }
    if (status) qb.andWhere('inv.status = :s', { s: status });
    if (type) qb.andWhere('inv.invoiceType = :t', { t: type });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, user?: any) {
    const inv = await this.invRepo.findOne({ where: { id }, relations: ['patient', 'items', 'items.medicine', 'payments', 'admission'] });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (user?.role === UserRole.PATIENT && inv.patientId !== user.patientId) {
      throw new ForbiddenException('You can only view your own invoices');
    }
    return inv;
  }

  async create(dto: any, userId: string) {
    const count = await this.invRepo.count();
    const inv = this.invRepo.create({
      invoiceNo: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
      patientId: dto.patientId,
      admissionId: dto.admissionId || null,
      invoiceType: dto.invoiceType || InvoiceType.OPD,
      status: InvoiceStatus.PENDING,
      subtotal: dto.subtotal || 0,
      discount: dto.discount || 0,
      tax: dto.tax || 0,
      totalAmount: (dto.subtotal || 0) - (dto.discount || 0) + (dto.tax || 0),
      paidAmount: 0,
      dueAmount: (dto.subtotal || 0) - (dto.discount || 0) + (dto.tax || 0),
      createdById: userId,
    });
    const saved = await this.invRepo.save(inv);
    // Create items
    if (dto.items) {
      for (const item of dto.items) {
        const invItem = this.itemRepo.create({ invoiceId: saved.id, description: item.description, itemType: item.itemType, medicineId: item.medicineId || null, quantity: item.quantity || 1, unitPrice: item.unitPrice || 0, totalPrice: (item.quantity || 1) * (item.unitPrice || 0) });
        await this.itemRepo.save(invItem);
      }
    }
    return this.findOne(saved.id);
  }

  async addPayment(invoiceId: string, dto: { amount: number; paymentMethod: string; transactionId?: string; notes?: string }, userId: string) {
    const inv = await this.findOne(invoiceId);
    const payment = this.payRepo.create({ invoiceId, amount: dto.amount, paymentMethod: dto.paymentMethod as PaymentMethod, transactionId: dto.transactionId || null, receivedById: userId, receivedAt: new Date(), notes: dto.notes || null });
    await this.payRepo.save(payment);
    inv.paidAmount = Number(inv.paidAmount) + dto.amount;
    inv.dueAmount = Number(inv.totalAmount) - Number(inv.paidAmount);
    if (inv.dueAmount <= 0) inv.status = InvoiceStatus.PAID;
    else if (inv.paidAmount > 0) inv.status = InvoiceStatus.PARTIAL_PAID;
    await this.invRepo.save(inv);
    return this.findOne(invoiceId);
  }

  async getDailyCollection(date?: string) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    const payments = await this.payRepo.find({ where: { receivedAt: Between(start, end) }, relations: ['invoice', 'invoice.patient'] });
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod: Record<string, number> = {};
    for (const p of payments) {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + Number(p.amount);
    }
    return { date: d.toISOString().split('T')[0], total, count: payments.length, payments, byMethod };
  }

  async getOutstanding() {
    return this.invRepo.find({ where: { status: InvoiceStatus.PENDING }, relations: ['patient'], order: { createdAt: 'ASC' } });
  }
}
