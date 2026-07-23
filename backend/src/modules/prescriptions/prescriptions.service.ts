import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionMedicine } from '../../entities/prescription-medicine.entity';
import { Medicine } from '../../entities/medicine.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription) private rxRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionMedicine) private rxMedRepo: Repository<PrescriptionMedicine>,
    @InjectRepository(Medicine) private medRepo: Repository<Medicine>,
  ) {}

  async findAll(query: any) {
    const qb = this.rxRepo.createQueryBuilder('rx')
      .leftJoinAndSelect('rx.patient', 'patient')
      .leftJoinAndSelect('rx.doctor', 'doctor')
      .leftJoinAndSelect('rx.medicines', 'meds')
      .leftJoinAndSelect('meds.medicine', 'medicine')
      .orderBy('rx.createdAt', 'DESC');
    if (query.patientId) qb.andWhere('rx.patientId = :pid', { pid: query.patientId });
    if (query.doctorId) qb.andWhere('rx.doctorId = :did', { did: query.doctorId });
    return qb.getMany();
  }

  async findOne(id: string) {
    const rx = await this.rxRepo.findOne({ where: { id }, relations: ['patient', 'doctor', 'medicines', 'medicines.medicine', 'appointment'] });
    if (!rx) throw new NotFoundException('Prescription not found');
    return rx;
  }

  async searchMedicines(query: string) {
    return this.medRepo.find({
      where: [
        { name: ILike(`%${query}%`) },
        { genericName: ILike(`%${query}%`) },
        { brandName: ILike(`%${query}%`) },
      ],
      take: 20,
    });
  }

  async create(dto: CreatePrescriptionDto, doctorId: string) {
    const count = await this.rxRepo.count();
    const rx = this.rxRepo.create({
      prescriptionNo: `PRX-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
      patientId: dto.patientId,
      doctorId,
      diagnosis: dto.diagnosis,
      chiefComplaint: dto.chiefComplaint || null,
      advice: dto.advice || null,
      followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
      appointmentId: dto.appointmentId || null,
    });
    const saved = await this.rxRepo.save(rx);

    for (const m of dto.medicines) {
      const pm = this.rxMedRepo.create({ prescriptionId: saved.id, medicineId: m.medicineId, dosage: m.dosage, duration: m.duration, instructions: m.instructions || null, quantity: m.quantity });
      await this.rxMedRepo.save(pm);
    }
    return this.findOne(saved.id);
  }
}
