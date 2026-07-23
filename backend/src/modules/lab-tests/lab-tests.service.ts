import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from '../../entities/lab-test.entity';
import { LabTestStatus } from '../../entities/enums';
import { CreateLabTestDto, CompleteLabTestDto } from './dto/create-lab-test.dto';

@Injectable()
export class LabTestsService {
  constructor(@InjectRepository(LabTest) private repo: Repository<LabTest>) {}

  async findAll(status?: string) {
    const qb = this.repo.createQueryBuilder('lt')
      .leftJoinAndSelect('lt.patient', 'patient')
      .leftJoinAndSelect('lt.testType', 'testType')
      .orderBy('lt.createdAt', 'DESC');
    if (status) qb.andWhere('lt.status = :s', { s: status });
    return qb.getMany();
  }

  async findOne(id: string) {
    const lt = await this.repo.findOne({ where: { id }, relations: ['patient', 'testType'] });
    if (!lt) throw new NotFoundException('Lab test not found');
    return lt;
  }

  async create(dto: CreateLabTestDto, requestedById: string) {
    const count = await this.repo.count();
    const test = this.repo.create({
      testNo: `LAB-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
      patientId: dto.patientId,
      testTypeId: dto.testTypeId,
      requestedById,
      status: LabTestStatus.REQUESTED,
    });
    return this.repo.save(test);
  }

  async updateStatus(id: string, status: LabTestStatus, userId?: string) {
    const test = await this.findOne(id);
    test.status = status;
    if (status === LabTestStatus.SAMPLE_COLLECTED) { test.sampleCollectedAt = new Date(); test.collectedById = userId || null; }
    if (status === LabTestStatus.COMPLETED) { test.completedAt = new Date(); test.completedById = userId || null; }
    return this.repo.save(test);
  }

  async complete(id: string, dto: CompleteLabTestDto, userId: string) {
    const test = await this.findOne(id);
    test.status = LabTestStatus.COMPLETED;
    test.results = dto.results || null;
    test.resultNotes = dto.resultNotes || null;
    test.completedAt = new Date();
    test.completedById = userId;
    return this.repo.save(test);
  }

  async getTestTypes() {
    const { LabTestType } = require('../../entities/lab-test-type.entity');
    const ds = this.repo.manager.connection;
    return ds.getRepository('LabTestType').find({ where: { isActive: true } });
  }
}
