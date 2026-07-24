import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from '../../entities/doctor-schedule.entity';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentStatus, UserRole } from '../../entities/enums';

export interface TimeSlot {
  time: string;
  label: string;
  maxPatients: number;
  booked: number;
  available: number;
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private scheduleRepo: Repository<DoctorSchedule>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async findByDoctor(doctorId: string, user?: any) {
    // DOCTOR can only view their own schedule
    if (user?.role === UserRole.DOCTOR && doctorId !== user.staffId) {
      throw new ForbiddenException('You can only view your own schedule');
    }
    return this.scheduleRepo.find({
      where: { doctorId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async upsert(doctorId: string, schedules: Partial<DoctorSchedule>[], user?: any) {
    // DOCTOR can only edit their own schedule
    if (user?.role === UserRole.DOCTOR && doctorId !== user.staffId) {
      throw new ForbiddenException('You can only edit your own schedule');
    }
    await this.scheduleRepo.delete({ doctorId });
    const newSchedules = schedules.map((s) => {
      const schedule = new DoctorSchedule();
      schedule.doctorId = doctorId;
      schedule.dayOfWeek = s.dayOfWeek!;
      schedule.startTime = s.startTime!;
      schedule.endTime = s.endTime!;
      schedule.slotDuration = s.slotDuration || 20;
      schedule.maxPatients = s.maxPatients || 1;
      schedule.isActive = s.isActive !== false;
      return schedule;
    });
    return this.scheduleRepo.save(newSchedules);
  }

  /**
   * Generate available time slots for a doctor on a specific date.
   * Returns slots with capacity info (N slots left).
   */
  async getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]> {
    const dayOfWeek = date.getDay();

    const schedules = await this.scheduleRepo.find({
      where: { doctorId, dayOfWeek, isActive: true },
      order: { startTime: 'ASC' },
    });

    if (schedules.length === 0) return [];

    const dateStr = date.toISOString().split('T')[0];
    const existingAppts = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.doctor_id = :doctorId', { doctorId })
      .andWhere('apt.appointment_date = :date', { date: dateStr })
      .andWhere('apt.status NOT IN (:...excluded)', {
        excluded: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      })
      .getMany();

    const slotCounts = new Map<string, number>();
    for (const apt of existingAppts) {
      slotCounts.set(apt.timeSlot, (slotCounts.get(apt.timeSlot) || 0) + 1);
    }

    const slots: TimeSlot[] = [];

    for (const schedule of schedules) {
      const startParts = schedule.startTime.split(':').map(Number);
      const endParts = schedule.endTime.split(':').map(Number);
      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];
      const slotDuration = schedule.slotDuration || 20;

      for (let t = startMinutes; t + slotDuration <= endMinutes; t += slotDuration) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        const slotTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const endH = Math.floor((t + slotDuration) / 60);
        const endM = (t + slotDuration) % 60;
        const endSlotTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        const timeSlot = `${slotTime}-${endSlotTime}`;

        let label = 'Morning';
        if (h >= 12 && h < 17) label = 'Afternoon';
        else if (h >= 17) label = 'Evening';

        const booked = slotCounts.get(timeSlot) || 0;
        const max = schedule.maxPatients || 1;
        slots.push({
          time: timeSlot,
          label,
          maxPatients: max,
          booked,
          available: Math.max(0, max - booked),
        });
      }
    }

    return slots;
  }
}
