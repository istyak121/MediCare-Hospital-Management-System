import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission } from '../../entities/admission.entity';
import { Bed } from '../../entities/bed.entity';
import { ProgressNote } from '../../entities/progress-note.entity';
import { AdmissionStatus, AdmissionType, UserRole, BedStatus } from '../../entities/enums';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(Admission) private admRepo: Repository<Admission>,
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
    @InjectRepository(ProgressNote) private noteRepo: Repository<ProgressNote>,
  ) {}

  async findAll(status?: string, user?: any) {
    const qb = this.admRepo.createQueryBuilder('adm')
      .leftJoinAndSelect('adm.patient', 'patient')
      .leftJoinAndSelect('adm.doctor', 'doctor')
      .leftJoinAndSelect('adm.bed', 'bed')
      .leftJoinAndSelect('bed.ward', 'ward')
      .orderBy('adm.admissionDate', 'DESC');

    if (user?.role === UserRole.DOCTOR) {
      qb.andWhere('adm.doctorId = :staffId', { staffId: user.staffId });
    }
    // NURSE, RECEPTIONIST, ADMIN — see all

    if (status) qb.andWhere('adm.status = :s', { s: status });
    return qb.getMany();
  }

  async findOne(id: string, user?: any) {
    const adm = await this.admRepo.findOne({ where: { id }, relations: ['patient', 'doctor', 'bed', 'bed.ward', 'progressNotes', 'invoices'] });
    if (!adm) throw new NotFoundException('Admission not found');
    if (user?.role === UserRole.DOCTOR && adm.doctorId !== user.staffId) {
      throw new ForbiddenException('You can only view your own admissions');
    }
    return adm;
  }

  async admit(dto: any) {
    const count = await this.admRepo.count();
    const bed = await this.bedRepo.findOne({ where: { id: dto.bedId } });
    if (!bed || bed.status !== BedStatus.AVAILABLE) throw new Error('Bed not available');
    const adm = this.admRepo.create({
      admissionNo: `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
      patientId: dto.patientId, doctorId: dto.doctorId, bedId: dto.bedId,
      admissionDate: new Date(), admissionType: dto.admissionType || AdmissionType.PLANNED,
      diagnosis: dto.diagnosis || null, symptoms: dto.symptoms || [],
      status: AdmissionStatus.ACTIVE,
    });
    const saved = await this.admRepo.save(adm);
    bed.status = BedStatus.OCCUPIED;
    await this.bedRepo.save(bed);
    return this.findOne(saved.id);
  }

  async discharge(id: string, dto: { dischargeDate?: string; finalDiagnosis?: string }, user?: any) {
    const adm = await this.findOne(id, user);
    adm.status = AdmissionStatus.DISCHARGED;
    adm.dischargeDate = dto.dischargeDate ? new Date(dto.dischargeDate) : new Date();
    if (dto.finalDiagnosis) adm.diagnosis = dto.finalDiagnosis;
    const saved = await this.admRepo.save(adm);
    const bed = await this.bedRepo.findOne({ where: { id: adm.bedId } });
    if (bed) { bed.status = BedStatus.AVAILABLE; await this.bedRepo.save(bed); }
    return this.findOne(saved.id);
  }

  async transfer(id: string, newBedId: string) {
    const adm = await this.findOne(id);
    const oldBed = await this.bedRepo.findOne({ where: { id: adm.bedId } });
    const newBed = await this.bedRepo.findOne({ where: { id: newBedId } });
    if (!newBed || newBed.status !== BedStatus.AVAILABLE) throw new Error('New bed not available');
    if (oldBed) { oldBed.status = BedStatus.AVAILABLE; await this.bedRepo.save(oldBed); }
    adm.bedId = newBedId;
    newBed.status = BedStatus.OCCUPIED;
    await this.bedRepo.save(newBed);
    return this.admRepo.save(adm);
  }

  async addProgressNote(admissionId: string, doctorId: string, note: string, user?: any) {
    // Verify ownership: doctor can only add notes to their own admissions
    if (user?.role === UserRole.DOCTOR) {
      const adm = await this.findOne(admissionId, user);
    }
    const pn = this.noteRepo.create({ admissionId, doctorId, note });
    return this.noteRepo.save(pn);
  }

  async getBedAvailability(wardId?: string) {
    const qb = this.bedRepo.createQueryBuilder('bed')
      .leftJoinAndSelect('bed.ward', 'ward')
      .leftJoinAndSelect('bed.admissions', 'adm', 'adm.status = :active', { active: AdmissionStatus.ACTIVE })
      .leftJoinAndSelect('adm.patient', 'patient');
    if (wardId) qb.where('bed.wardId = :wid', { wid: wardId });
    return qb.getMany();
  }

  async getWards() {
    const { Ward } = require('../../entities/ward.entity');
    return this.admRepo.manager.getRepository('Ward').find({ relations: ['beds'] });
  }
}
