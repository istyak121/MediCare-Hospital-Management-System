import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, Between, FindManyOptions } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: QueryPatientDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const qb = this.patientRepo.createQueryBuilder('patient');

    if (query.search) {
      qb.andWhere(
        '(patient.fullName ILIKE :search OR patient.fullNameBn ILIKE :search OR patient.phone ILIKE :search OR patient.patientId ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.gender) {
      qb.andWhere('patient.gender = :gender', { gender: query.gender });
    }
    if (query.bloodGroup) {
      qb.andWhere('patient.bloodGroup = :bg', { bg: query.bloodGroup });
    }
    if (query.dateRange) {
      const now = new Date();
      let start: Date;
      if (query.dateRange === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (query.dateRange === 'week') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else {
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      qb.andWhere('patient.createdAt >= :start', { start });
    }

    qb.orderBy('patient.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['user', 'appointments', 'appointments.doctor', 'admissions', 'prescriptions', 'labTests', 'invoices'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient;
  }

  async findByPhone(phone: string) {
    return this.patientRepo.findOne({ where: { phone } });
  }

  async create(dto: CreatePatientDto) {
    // Duplicate phone check
    const existing = await this.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException({ message: 'Patient with this phone already exists', patientId: existing.id, patientName: existing.fullName });
    }

    const patient = new Patient();
    Object.assign(patient, dto);
    patient.dateOfBirth = new Date(dto.dateOfBirth);

    // Generate PAT-YYYY-XXXXX ID
    const year = new Date().getFullYear();
    const count = await this.patientRepo.count();
    patient.patientId = `PAT-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.patientRepo.save(patient);
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    if (dto.dateOfBirth) patient.dateOfBirth = new Date(dto.dateOfBirth);
    return this.patientRepo.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    await this.patientRepo.softRemove(patient);
    return { message: 'Patient archived successfully' };
  }

  // Aggregated history endpoint
  async getHistory(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['appointments', 'appointments.doctor', 'prescriptions', 'prescriptions.doctor', 'labTests', 'labTests.testType', 'admissions', 'admissions.doctor', 'invoices'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return {
      patient,
      summary: {
        totalAppointments: patient.appointments?.length || 0,
        totalPrescriptions: patient.prescriptions?.length || 0,
        totalLabTests: patient.labTests?.length || 0,
        totalAdmissions: patient.admissions?.length || 0,
        totalInvoices: patient.invoices?.length || 0,
      },
    };
  }

  async getAppointments(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['appointments', 'appointments.doctor', 'appointments.vitals'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient.appointments || [];
  }

  async getAdmissions(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['admissions', 'admissions.doctor', 'admissions.bed', 'admissions.bed.ward'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient.admissions || [];
  }

  async getPrescriptions(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['prescriptions', 'prescriptions.doctor', 'prescriptions.medicines', 'prescriptions.medicines.medicine'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient.prescriptions || [];
  }

  async getLabTests(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['labTests', 'labTests.testType'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient.labTests || [];
  }

  async getInvoices(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['invoices', 'invoices.items', 'invoices.payments'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient.invoices || [];
  }
}
