import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
  ) {}

  findAll() {
    return this.deptRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.deptRepo.findOne({ where: { id }, relations: ['staff', 'wards'] });
  }

  findDoctors(deptId: string) {
    return this.deptRepo.findOne({
      where: { id: deptId },
      relations: ['staff', 'staff.user'],
    });
  }
}
