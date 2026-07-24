import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vitals } from '../../entities/vitals.entity';
import { Appointment } from '../../entities/appointment.entity';
import { UserRole } from '../../entities/enums';

export interface VitalsAlert {
  field: string;
  level: 'normal' | 'warning' | 'critical';
  message: string;
}

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(Vitals)
    private vitalsRepo: Repository<Vitals>,
    @InjectRepository(Appointment)
    private aptRepo: Repository<Appointment>,
  ) {}

  async findByAppointment(appointmentId: string, user?: any) {
    // Check access for DOCTOR
    if (user?.role === UserRole.DOCTOR) {
      const apt = await this.aptRepo.findOne({ where: { id: appointmentId } });
      if (!apt || apt.doctorId !== user.staffId) {
        throw new ForbiddenException('You can only view vitals for your own appointments');
      }
    }

    const vitals = await this.vitalsRepo.findOne({ where: { appointmentId } });
    if (!vitals) throw new NotFoundException('Vitals not recorded for this appointment');
    return { ...vitals, alerts: this.getAlerts(vitals) };
  }

  async create(appointmentId: string, recordedById: string, dto: Partial<Vitals>) {
    const apt = await this.aptRepo.findOne({ where: { id: appointmentId } });
    if (!apt) throw new NotFoundException('Appointment not found');

    // Check if vitals already exist
    const existing = await this.vitalsRepo.findOne({ where: { appointmentId } });
    if (existing) throw new Error('Vitals already recorded for this appointment');

    const vitals = new Vitals();
    vitals.appointmentId = appointmentId;
    vitals.recordedById = recordedById;
    vitals.temperature = dto.temperature ?? null;
    vitals.bloodPressure = dto.bloodPressure ?? null;
    vitals.pulseRate = dto.pulseRate ?? null;
    vitals.respiratoryRate = dto.respiratoryRate ?? null;
    vitals.spo2 = dto.spo2 ?? null;
    vitals.weight = dto.weight ?? null;
    vitals.height = dto.height ?? null;

    // Auto-calculate BMI
    if (vitals.weight && vitals.height) {
      const heightM = Number(vitals.height) / 100;
      vitals.bmi = Math.round((Number(vitals.weight) / (heightM * heightM)) * 100) / 100;
    }

    const saved = await this.vitalsRepo.save(vitals);
    return { ...saved, alerts: this.getAlerts(saved) };
  }

  async update(id: string, dto: Partial<Vitals>) {
    const vitals = await this.vitalsRepo.findOne({ where: { id } });
    if (!vitals) throw new NotFoundException('Vitals not found');

    Object.assign(vitals, dto);

    // Recalculate BMI
    if (vitals.weight && vitals.height) {
      const heightM = Number(vitals.height) / 100;
      vitals.bmi = Math.round((Number(vitals.weight) / (heightM * heightM)) * 100) / 100;
    }

    const saved = await this.vitalsRepo.save(vitals);
    return { ...saved, alerts: this.getAlerts(saved) };
  }

  /**
   * Clinical alert thresholds per spec §7.5
   */
  private getAlerts(vitals: Vitals): VitalsAlert[] {
    const alerts: VitalsAlert[] = [];

    // Blood Pressure
    if (vitals.bloodPressure) {
      const parts = vitals.bloodPressure.split('/');
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (sys > 180 || dia > 110) {
          alerts.push({ field: 'bloodPressure', level: 'critical', message: 'Hypertensive Crisis — Alert Doctor Immediately' });
        } else if (sys > 140 || dia > 90) {
          alerts.push({ field: 'bloodPressure', level: 'warning', message: 'High Blood Pressure — Stage 2 Hypertension' });
        } else {
          alerts.push({ field: 'bloodPressure', level: 'normal', message: 'Blood pressure normal' });
        }
      }
    }

    // Temperature
    if (vitals.temperature != null) {
      const temp = Number(vitals.temperature);
      if (temp > 40) {
        alerts.push({ field: 'temperature', level: 'critical', message: 'Hyperpyrexia — Critical high fever' });
      } else if (temp > 38) {
        alerts.push({ field: 'temperature', level: 'warning', message: 'Fever — Monitor closely' });
      } else {
        alerts.push({ field: 'temperature', level: 'normal', message: 'Temperature normal' });
      }
    }

    // SpO2
    if (vitals.spo2 != null) {
      const spo2 = Number(vitals.spo2);
      if (spo2 < 90) {
        alerts.push({ field: 'spo2', level: 'critical', message: 'Severe Hypoxemia — Oxygen therapy needed' });
      } else if (spo2 < 95) {
        alerts.push({ field: 'spo2', level: 'warning', message: 'Mild Hypoxemia — Monitor oxygen levels' });
      } else {
        alerts.push({ field: 'spo2', level: 'normal', message: 'Oxygen saturation normal' });
      }
    }

    // Pulse Rate
    if (vitals.pulseRate != null) {
      if (vitals.pulseRate > 120 || vitals.pulseRate < 50) {
        alerts.push({ field: 'pulseRate', level: 'critical', message: 'Abnormal heart rate — Alert doctor' });
      } else if (vitals.pulseRate > 100 || vitals.pulseRate < 60) {
        alerts.push({ field: 'pulseRate', level: 'warning', message: 'Borderline heart rate' });
      } else {
        alerts.push({ field: 'pulseRate', level: 'normal', message: 'Pulse rate normal' });
      }
    }

    return alerts;
  }
}
