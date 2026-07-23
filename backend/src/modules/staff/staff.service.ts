import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepo: Repository<Staff>,
  ) {}

  findAll(departmentId?: string) {
    const qb = this.staffRepo.createQueryBuilder('staff')
      .leftJoinAndSelect('staff.user', 'user')
      .leftJoinAndSelect('staff.department', 'department');
    if (departmentId) {
      qb.andWhere('staff.departmentId = :deptId', { deptId: departmentId });
    }
    return qb.getMany();
  }

  findDoctors(departmentId?: string) {
    const qb = this.staffRepo.createQueryBuilder('staff')
      .leftJoinAndSelect('staff.user', 'user')
      .leftJoinAndSelect('staff.department', 'department')
      .where('staff.specialization IS NOT NULL');
    if (departmentId) {
      qb.andWhere('staff.departmentId = :deptId', { deptId: departmentId });
    }
    return qb.getMany();
  }

  findOne(id: string) {
    return this.staffRepo.findOne({
      where: { id },
      relations: ['user', 'department', 'schedules', 'schedules.appointments'],
    });
  }
}
