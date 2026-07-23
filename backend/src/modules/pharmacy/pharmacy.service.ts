import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, ILike } from 'typeorm';
import { Medicine } from '../../entities/medicine.entity';

@Injectable()
export class PharmacyService {
  constructor(@InjectRepository(Medicine) private medRepo: Repository<Medicine>) {}

  async findAll(category?: string, search?: string) {
    const qb = this.medRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.supplier', 'supplier')
      .orderBy('m.name', 'ASC');
    if (category) qb.andWhere('m.category = :cat', { cat: category });
    if (search) qb.andWhere('(m.name ILIKE :s OR m.genericName ILIKE :s OR m.brandName ILIKE :s)', { s: `%${search}%` });
    return qb.getMany();
  }

  async findOne(id: string) {
    const m = await this.medRepo.findOne({ where: { id }, relations: ['supplier'] });
    if (!m) throw new NotFoundException('Medicine not found');
    return m;
  }

  async create(dto: Partial<Medicine>) {
    const med = this.medRepo.create(dto);
    return this.medRepo.save(med);
  }

  async update(id: string, dto: Partial<Medicine>) {
    const med = await this.findOne(id);
    Object.assign(med, dto);
    return this.medRepo.save(med);
  }

  async adjustStock(id: string, quantity: number, reason?: string) {
    const med = await this.findOne(id);
    med.stockQuantity += quantity;
    return this.medRepo.save(med);
  }

  async getLowStock() {
    return this.medRepo.find({ where: { stockQuantity: LessThan(10) }, order: { stockQuantity: 'ASC' } });
  }

  // Dispensing: check stock, deduct for each medicine
  async dispense(items: { medicineId: string; quantity: number }[]) {
    const results: any[] = [];
    for (const item of items) {
      const med = await this.findOne(item.medicineId);
      if (med.stockQuantity < item.quantity) {
        results.push({ medicineId: item.medicineId, name: med.name, requested: item.quantity, available: med.stockQuantity, status: 'insufficient' });
      } else {
        med.stockQuantity -= item.quantity;
        await this.medRepo.save(med);
        results.push({ medicineId: item.medicineId, name: med.name, dispensed: item.quantity, status: 'dispensed' });
      }
    }
    return results;
  }
}
