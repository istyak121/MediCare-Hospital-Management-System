import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Patient } from '../../entities/patient.entity';
import { Staff } from '../../entities/staff.entity';
import { DoctorSchedule } from '../../entities/doctor-schedule.entity';
import {
  AppointmentStatus, AppointmentType,
} from '../../entities/enums';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['checked_in', 'in_progress', 'cancelled', 'no_show', 'completed'],
  checked_in: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
};

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private aptRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Staff)
    private staffRepo: Repository<Staff>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepo: Repository<DoctorSchedule>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: QueryAppointmentDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const qb = this.aptRepo.createQueryBuilder('apt')
      .leftJoinAndSelect('apt.patient', 'patient')
      .leftJoinAndSelect('apt.doctor', 'doctor')
      .leftJoinAndSelect('apt.schedule', 'schedule')
      .leftJoinAndSelect('apt.vitals', 'vitals');

    if (query.date) {
      qb.andWhere('apt.appointmentDate = :date', { date: query.date });
    }
    if (query.doctorId) {
      qb.andWhere('apt.doctorId = :doctorId', { doctorId: query.doctorId });
    }
    if (query.status) {
      qb.andWhere('apt.status = :status', { status: query.status });
    }
    if (query.patientId) {
      qb.andWhere('apt.patientId = :patientId', { patientId: query.patientId });
    }

    qb.orderBy('apt.appointmentDate', 'DESC')
      .addOrderBy('apt.timeSlot', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const apt = await this.aptRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.department', 'schedule', 'vitals', 'prescription'],
    });
    if (!apt) throw new NotFoundException(`Appointment ${id} not found`);
    return apt;
  }

  async create(dto: CreateAppointmentDto) {
    // Validate references exist
    const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
    if (!patient) throw new BadRequestException('Patient not found');

    const doctor = await this.staffRepo.findOne({ where: { id: dto.doctorId } });
    if (!doctor) throw new BadRequestException('Doctor not found');

    const schedule = await this.scheduleRepo.findOne({ where: { id: dto.scheduleId } });
    if (!schedule) throw new BadRequestException('Schedule not found');

    // Slot-locking: use a query runner with SELECT FOR UPDATE to prevent concurrent booking
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Slot-locking: SELECT existing rows with FOR UPDATE (row-level lock)
      // then count in-memory — PostgreSQL forbids FOR UPDATE with COUNT()
      const existingRows = await queryRunner.manager
        .createQueryBuilder(Appointment, 'apt')
        .setLock('pessimistic_write')
        .where('apt.scheduleId = :scheduleId', { scheduleId: dto.scheduleId })
        .andWhere('apt.appointmentDate = :date', { date: dto.appointmentDate })
        .andWhere('apt.timeSlot = :slot', { slot: dto.timeSlot })
        .andWhere('apt.status NOT IN (:...excluded)', {
          excluded: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        })
        .getMany();

      if (existingRows.length >= schedule.maxPatients) {
        throw new ConflictException(`Slot ${dto.timeSlot} is fully booked (${schedule.maxPatients} max)`);
      }

      // Generate appointment number: APT-YYYYMMDD-XXX
      const dateStr = dto.appointmentDate.replace(/-/g, '');
      const count = await queryRunner.manager.count(Appointment, {
        where: { appointmentDate: new Date(dto.appointmentDate) },
      });
      const appointmentNo = `APT-${dateStr}-${String(count + 1).padStart(3, '0')}`;

      const appointment = new Appointment();
      appointment.appointmentNo = appointmentNo;
      appointment.patientId = dto.patientId;
      appointment.doctorId = dto.doctorId;
      appointment.scheduleId = dto.scheduleId;
      appointment.appointmentDate = new Date(dto.appointmentDate);
      appointment.timeSlot = dto.timeSlot;
      appointment.type = dto.type || AppointmentType.OPD;
      appointment.status = AppointmentStatus.SCHEDULED;
      appointment.chiefComplaint = dto.chiefComplaint || null;
      appointment.notes = dto.notes || null;

      const saved = await queryRunner.manager.save(appointment);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const apt = await this.findOne(id);

    const allowed = VALID_TRANSITIONS[apt.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${apt.status}" to "${dto.status}". Allowed: ${allowed?.join(', ') || 'none'}`,
      );
    }

    apt.status = dto.status as AppointmentStatus;
    if (dto.reason) {
      apt.notes = apt.notes ? `${apt.notes}\n[${dto.status}]: ${dto.reason}` : `[${dto.status}]: ${dto.reason}`;
    }

    return this.aptRepo.save(apt);
  }

  async update(id: string, dto: Partial<CreateAppointmentDto>) {
    const apt = await this.findOne(id);
    if (apt.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Can only modify appointments that are still scheduled');
    }
    Object.assign(apt, dto);
    if (dto.appointmentDate) apt.appointmentDate = new Date(dto.appointmentDate);
    return this.aptRepo.save(apt);
  }

  async remove(id: string) {
    const apt = await this.findOne(id);
    if (apt.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Can only cancel scheduled appointments');
    }
    apt.status = AppointmentStatus.CANCELLED;
    await this.aptRepo.save(apt);
    return { message: 'Appointment cancelled' };
  }

  /**
   * Today's queue grouped by status with wait times
   */
  async getTodayQueue() {
    const today = new Date().toISOString().split('T')[0];

    const appointments = await this.aptRepo
      .createQueryBuilder('apt')
      .leftJoinAndSelect('apt.patient', 'patient')
      .leftJoinAndSelect('apt.doctor', 'doctor')
      .leftJoinAndSelect('apt.vitals', 'vitals')
      .where('apt.appointmentDate = :today', { today })
      .andWhere('apt.status NOT IN (:...excluded)', {
        excluded: [AppointmentStatus.CANCELLED],
      })
      .orderBy('apt.timeSlot', 'ASC')
      .getMany();

    const now = new Date();
    const grouped: Record<string, any[]> = {
      scheduled: [],
      checked_in: [],
      in_progress: [],
      completed: [],
      no_show: [],
    };

    for (const apt of appointments) {
      const card = {
        id: apt.id,
        appointmentNo: apt.appointmentNo,
        timeSlot: apt.timeSlot,
        type: apt.type,
        status: apt.status,
        chiefComplaint: apt.chiefComplaint,
        patient: apt.patient ? {
          id: apt.patient.id,
          fullName: apt.patient.fullName,
          patientId: apt.patient.patientId,
          phone: apt.patient.phone,
          gender: apt.patient.gender,
          dateOfBirth: apt.patient.dateOfBirth,
        } : null,
        doctor: apt.doctor ? {
          id: apt.doctor.id,
          fullName: apt.doctor.fullName,
          specialization: apt.doctor.specialization,
        } : null,
        vitalsRecorded: !!apt.vitals,
        waitMinutes: apt.status === AppointmentStatus.CHECKED_IN
          ? Math.floor((now.getTime() - apt.createdAt.getTime()) / 60000)
          : 0,
      };

      if (grouped[apt.status]) {
        grouped[apt.status].push(card);
      }
    }

    return {
      date: today,
      total: appointments.length,
      counts: {
        scheduled: grouped.scheduled.length,
        checked_in: grouped.checked_in.length,
        in_progress: grouped.in_progress.length,
        completed: grouped.completed.length,
        no_show: grouped.no_show.length,
      },
      ...grouped,
    };
  }

  async getDoctorSchedule(doctorId: string, date?: string) {
    const qb = this.aptRepo
      .createQueryBuilder('apt')
      .leftJoinAndSelect('apt.patient', 'patient')
      .leftJoinAndSelect('apt.vitals', 'vitals')
      .where('apt.doctorId = :doctorId', { doctorId });

    if (date) {
      qb.andWhere('apt.appointmentDate = :date', { date });
    }

    return qb.orderBy('apt.appointmentDate', 'ASC').addOrderBy('apt.timeSlot', 'ASC').getMany();
  }
}
