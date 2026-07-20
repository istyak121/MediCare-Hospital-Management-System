// ============================================================
// MediCare HMS — Root Application Module
// ============================================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Staff } from './entities/staff.entity';
import { Patient } from './entities/patient.entity';
import { Department } from './entities/department.entity';
import { Ward } from './entities/ward.entity';
import { Bed } from './entities/bed.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { Appointment } from './entities/appointment.entity';
import { Vitals } from './entities/vitals.entity';
import { Admission } from './entities/admission.entity';
import { ProgressNote } from './entities/progress-note.entity';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionMedicine } from './entities/prescription-medicine.entity';
import { Medicine } from './entities/medicine.entity';
import { Supplier } from './entities/supplier.entity';
import { LabTest } from './entities/lab-test.entity';
import { LabTestType } from './entities/lab-test-type.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';
import { HealthPackage } from './entities/health-package.entity';
import { Notification } from './entities/notification.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Setting } from './entities/setting.entity';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
// AuditSubscriber temporarily removed — will re-enable in Phase 2
// import { AuditSubscriber } from './common/subscribers/audit.subscriber';

const allEntities = [
  User, RefreshToken, Staff, Patient, Department, Ward, Bed,
  DoctorSchedule, Appointment, Vitals, Admission, ProgressNote,
  Prescription, PrescriptionMedicine, Medicine, Supplier,
  LabTest, LabTestType, Invoice, InvoiceItem, Payment,
  HealthPackage, Notification, AuditLog, Setting,
];

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: allEntities,
        subscribers: [],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
        poolSize: 10,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Feature modules
    HealthModule,
    AuthModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
