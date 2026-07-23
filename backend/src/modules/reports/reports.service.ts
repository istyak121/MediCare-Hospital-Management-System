import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Appointment } from '../../entities/appointment.entity';
import { Bed } from '../../entities/bed.entity';
import { BedStatus } from '../../entities/enums';
import { Prescription } from '../../entities/prescription.entity';
import { Invoice } from '../../entities/invoice.entity';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private aptRepo: Repository<Appointment>,
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
    @InjectRepository(Prescription) private rxRepo: Repository<Prescription>,
    @InjectRepository(Invoice) private invRepo: Repository<Invoice>,
    @InjectRepository(Payment) private payRepo: Repository<Payment>,
  ) {}

  async getPatientStats() {
    const total = await this.patientRepo.count();
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = await this.aptRepo.createQueryBuilder('a').where('a.appointmentDate = :d', { d: today }).getCount();
    const activeAdmissions = await this.bedRepo.count({ where: { status: BedStatus.OCCUPIED } });
    return { totalPatients: total, todayAppointments: todayAppts, activeAdmissions };
  }

  async getRevenue(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const payments = await this.payRepo.find({ where: { receivedAt: Between(since, new Date()) }, order: { receivedAt: 'ASC' } });
    const total = payments.reduce((s, p) => s + Number(p.amount), 0);
    const byDate: Record<string, number> = {};
    for (const p of payments) {
      const d = p.receivedAt.toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + Number(p.amount);
    }
    return { days, total, count: payments.length, byDate };
  }

  async getBedOccupancy() {
    const total = await this.bedRepo.count();
    const available = await this.bedRepo.count({ where: { status: BedStatus.AVAILABLE } });
    const occupied = await this.bedRepo.count({ where: { status: BedStatus.OCCUPIED } });
    const reserved = await this.bedRepo.count({ where: { status: BedStatus.RESERVED } });
    const maintenance = await this.bedRepo.count({ where: { status: BedStatus.UNDER_MAINTENANCE } });
    return { total, available, occupied, reserved, maintenance, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  }

  async getTopDiagnoses() {
    const rxs = await this.rxRepo.find({ take: 100, order: { createdAt: 'DESC' } });
    const count: Record<string, number> = {};
    for (const rx of rxs) {
      const diag = rx.diagnosis?.split(',')[0]?.trim() || 'Other';
      count[diag] = (count[diag] || 0) + 1;
    }
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([diagnosis, count]) => ({ diagnosis, count }));
  }
}
