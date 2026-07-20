# 🏥 MediCare HMS — Technical Specification v2.0
## Next.js 15 + NestJS + PostgreSQL Full-Stack Hospital Management System
### Production-Ready, Vibe-Coding Ready Project Plan

---

## Table of Contents
1. Project Overview
2. Architecture & Tech Stack
3. Database Schema (TypeORM)
4. User Roles & Permissions
5. API Design (REST + Swagger)
6. Frontend Design System
7. Module-by-Module Feature Specs
8. Frontend Pages & Components
9. Real-Time Features (WebSockets)
10. File Storage & PDF Generation
11. Implementation Roadmap
12. Project Structure
13. Environment Configuration
14. Deployment Guide
15. Demo Data Seeding

---

## 1. Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | MediCare HMS |
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui |
| **Backend** | NestJS 11 + TypeScript + TypeORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis (sessions, rate limiting, real-time data) |
| **Real-Time** | Socket.io (NestJS Gateway) |
| **Auth** | JWT Access Token (15min) + Refresh Token (7 days) + httpOnly cookies |
| **Validation** | Zod (shared schemas) + class-validator (NestJS) |
| **API Docs** | Swagger (OpenAPI 3.0) auto-generated |
| **Testing** | Jest + React Testing Library + Supertest |
| **Deployment** | Docker Compose (dev) / Docker Swarm or Kubernetes (prod) |
| **Language** | English + Bengali (i18n via next-intl) |
| **Currency** | BDT (৳) |

### Why This Stack for Your CV?
- **Next.js App Router** — Demonstrates modern React patterns (Server Components, Server Actions, parallel routes, intercepting routes)
- **NestJS** — Enterprise-grade Node.js framework with DI, decorators, modules, guards, interceptors
- **TypeORM** — Type-safe ORM with migrations, relations, eager loading
- **Full i18n** — Shows you understand internationalization
- **Real-time** — WebSockets for live notifications and queue updates
- **PDF generation** — Server-side PDF with Puppeteer for prescriptions & invoices
- **Role-based dashboards** — 9 distinct user experiences from one codebase

---

## 2. Architecture & Tech Stack

### 2.1 System Architecture

```
CLIENT LAYER
  Staff Web (Desktop)    Patient Web (Mobile)    Display TV (Queue)
  Next.js 15             Next.js 15              Next.js 15
         |                      |                       |
         └──────────────────────┼───────────────────────┘
                                | HTTPS / WSS
                    API GATEWAY (Nginx)
                                |
                    APPLICATION LAYER (NestJS)
                    Auth | Patient | Appointment | Prescription | Lab
                    Pharmacy | Admission | Billing | Staff | Report
                                |
                    DATA LAYER
                    PostgreSQL (TypeORM) | Redis (ioredis) | File Storage
```

### 2.2 Detailed Stack

#### Frontend (Next.js 15)
| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router, Server Components, Server Actions |
| TypeScript | Type safety across the app |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible, customizable component primitives |
| Radix UI | Headless UI primitives (under shadcn) |
| Framer Motion | Smooth animations, page transitions, micro-interactions |
| TanStack Query v5 | Server state management, caching, optimistic updates |
| Zustand | Client state (auth, theme, sidebar) |
| React Hook Form | Form handling with Zod resolver |
| Zod | Schema validation (shared with backend) |
| next-intl | Internationalization (EN + BN) |
| Recharts | Charts and analytics |
| date-fns | Date manipulation |
| lucide-react | Icons |
| sonner | Toast notifications |
| @react-pdf/renderer | Client-side PDF preview |

#### Backend (NestJS 11)
| Technology | Purpose |
|------------|---------|
| NestJS 11 | Modular architecture, DI, decorators |
| TypeORM 0.3 | PostgreSQL ORM with migrations |
| @nestjs/platform-socket.io | Real-time WebSocket gateway |
| @nestjs/swagger | Auto-generated API documentation |
| @nestjs/jwt | JWT token handling |
| @nestjs/passport | Authentication strategies |
| bcrypt | Password hashing |
| class-validator | DTO validation |
| Puppeteer | Server-side PDF generation |
| ioredis | Redis client for sessions/cache |
| @nestjs/throttler | Rate limiting |
| winston | Structured logging |
| @nestjs/config | Environment configuration |

---

## 3. Database Schema (TypeORM)

### 3.1 Entity Relationship Overview

```
User (1) ──────── (1) Staff
  |
  └────────────── (1) Patient

Patient (1) ────── (*) Appointment ─── (1) DoctorSchedule ─── (1) Staff
  |                    |
  |──────────────── (*) Prescription ── (*) PrescriptionMedicine ── (1) Medicine
  |                    |
  |──────────────── (*) LabTest ─────── (1) LabTestType
  |                    |
  |──────────────── (*) Admission ───── (1) Bed ────────────── (1) Ward ─── (1) Department
  |                    |
  └──────────────── (*) Invoice ─────── (*) InvoiceItem ─────── (*) Payment

Department (1) ─── (*) Staff
Department (1) ─── (*) Ward
Medicine (*) ───── (1) Supplier
Staff (1) ──────── (*) DoctorSchedule
Staff (1) ──────── (*) AuditLog
User (1) ───────── (*) Notification
```

### 3.2 Complete TypeORM Entities

```typescript
// ============================================================
// src/entities/user.entity.ts
// ============================================================
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
         UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  LAB_TECHNICIAN = 'lab_technician',
  PHARMACIST = 'pharmacist',
  ACCOUNTANT = 'accountant',
  PATIENT = 'patient',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // bcrypt hashed

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 'en' })
  preferredLanguage: string; // 'en' | 'bn'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staff: Staff;

  @OneToOne(() => Patient, (patient) => patient.user, { nullable: true })
  patient: Patient;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}

// ============================================================
// src/entities/department.entity.ts
// ============================================================
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "Cardiology"

  @Column({ nullable: true })
  nameBn: string; // Bengali name

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string; // Lucide icon name

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Staff, (staff) => staff.department)
  staff: Staff[];

  @OneToMany(() => Ward, (ward) => ward.department)
  wards: Ward[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/staff.entity.ts
// ============================================================
export enum Gender { MALE = 'male', FEMALE = 'female', OTHER = 'other' }

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  fullNameBn: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ unique: true })
  employeeId: string; // e.g., EMP-2026-001

  @Column()
  designation: string; // e.g., "Senior Consultant"

  @ManyToOne(() => Department, (dept) => dept.staff)
  @JoinColumn()
  department: Department;

  @Column()
  departmentId: string;

  // Doctor-specific fields
  @Column({ nullable: true })
  specialization: string;

  @Column('simple-array', { nullable: true })
  qualifications: string[]; // ["MBBS", "MD (Cardiology)"]

  @Column({ type: 'int', nullable: true })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultationFee: number;

  // Nurse-specific
  @ManyToOne(() => Ward, (ward) => ward.staff, { nullable: true })
  @JoinColumn()
  ward: Ward;

  @Column({ nullable: true })
  wardId: string;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules: DoctorSchedule[];

  @OneToMany(() => Appointment, (apt) => apt.doctor)
  appointments: Appointment[];

  @OneToMany(() => Prescription, (rx) => rx.doctor)
  prescriptions: Prescription[];

  @OneToMany(() => Admission, (adm) => adm.doctor)
  admissions: Admission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/patient.entity.ts
// ============================================================
export enum BloodGroup {
  A_POSITIVE = 'A+', A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+', B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+', AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+', O_NEGATIVE = 'O-',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ unique: true })
  patientId: string; // e.g., PAT-2026-00001

  @Column()
  fullName: string;

  @Column({ nullable: true })
  fullNameBn: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: BloodGroup, nullable: true })
  bloodGroup: BloodGroup;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  emergencyContactName: string;

  @Column({ nullable: true })
  emergencyContactPhone: string;

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column('simple-array', { nullable: true })
  chronicDiseases: string[];

  @Column('simple-array', { nullable: true })
  currentMedications: string[];

  @OneToMany(() => Appointment, (apt) => apt.patient)
  appointments: Appointment[];

  @OneToMany(() => Admission, (adm) => adm.patient)
  admissions: Admission[];

  @OneToMany(() => Prescription, (rx) => rx.patient)
  prescriptions: Prescription[];

  @OneToMany(() => LabTest, (test) => test.patient)
  labTests: LabTest[];

  @OneToMany(() => Invoice, (inv) => inv.patient)
  invoices: Invoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/ward.entity.ts
// ============================================================
export enum WardType {
  GENERAL = 'general',
  CABIN = 'cabin',
  ICU = 'icu',
  NICU = 'nicu',
  CCU = 'ccu',
  EMERGENCY = 'emergency',
}

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "General Ward A"

  @Column({ type: 'enum', enum: WardType })
  wardType: WardType;

  @ManyToOne(() => Department, (dept) => dept.wards)
  @JoinColumn()
  department: Department;

  @Column()
  departmentId: string;

  @Column()
  floorNumber: number;

  @OneToMany(() => Bed, (bed) => bed.ward)
  beds: Bed[];

  @OneToMany(() => Staff, (staff) => staff.ward)
  staff: Staff[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/bed.entity.ts
// ============================================================
export enum BedType {
  GENERAL = 'general',
  SEMI_PRIVATE = 'semi_private',
  PRIVATE = 'private',
  DELUXE = 'deluxe',
}

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  UNDER_MAINTENANCE = 'under_maintenance',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bedNumber: string; // e.g., "A-01"

  @ManyToOne(() => Ward, (ward) => ward.beds)
  @JoinColumn()
  ward: Ward;

  @Column()
  wardId: string;

  @Column({ type: 'enum', enum: BedType })
  bedType: BedType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dailyRent: number;

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status: BedStatus;

  @OneToMany(() => Admission, (adm) => adm.bed)
  admissions: Admission[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/doctor-schedule.entity.ts
// ============================================================
@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff, (staff) => staff.schedules)
  @JoinColumn()
  doctor: Staff;

  @Column()
  doctorId: string;

  @Column({ type: 'int' }) // 0=Sunday, 6=Saturday
  dayOfWeek: number;

  @Column() // "09:00" 24h format
  startTime: string;

  @Column() // "17:00"
  endTime: string;

  @Column({ type: 'int', default: 20 }) // minutes
  slotDuration: number;

  @Column({ type: 'int', default: 1 })
  maxPatients: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (apt) => apt.schedule)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/appointment.entity.ts
// ============================================================
export enum AppointmentType {
  OPD = 'opd',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  TELEMEDICINE = 'telemedicine',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  appointmentNo: string; // APT-20260721-001

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  @JoinColumn()
  doctor: Staff;

  @Column()
  doctorId: string;

  @ManyToOne(() => DoctorSchedule, (schedule) => schedule.appointments)
  @JoinColumn()
  schedule: DoctorSchedule;

  @Column()
  scheduleId: string;

  @Column({ type: 'date' })
  appointmentDate: Date;

  @Column() // "10:00-10:20"
  timeSlot: string;

  @Column({ type: 'enum', enum: AppointmentType, default: AppointmentType.OPD })
  type: AppointmentType;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToOne(() => Vitals, (vitals) => vitals.appointment, { nullable: true })
  vitals: Vitals;

  @OneToOne(() => Prescription, (rx) => rx.appointment, { nullable: true })
  prescription: Prescription;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/vitals.entity.ts
// ============================================================
@Entity('vitals')
export class Vitals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Appointment, (apt) => apt.vitals)
  @JoinColumn()
  appointment: Appointment;

  @Column()
  appointmentId: string;

  @Column()
  recordedById: string; // Nurse ID

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number; // Celsius

  @Column({ nullable: true })
  bloodPressure: string; // "120/80"

  @Column({ type: 'int', nullable: true })
  pulseRate: number; // bpm

  @Column({ type: 'int', nullable: true })
  respiratoryRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  spo2: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // cm

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi: number;

  @CreateDateColumn()
  recordedAt: Date;
}

// ============================================================
// src/entities/admission.entity.ts
// ============================================================
export enum AdmissionType {
  EMERGENCY = 'emergency',
  PLANNED = 'planned',
  REFERRED = 'referred',
}

export enum AdmissionStatus {
  ACTIVE = 'active',
  DISCHARGED = 'discharged',
  TRANSFERRED = 'transferred',
  DECEASED = 'deceased',
}

@Entity('admissions')
export class Admission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  admissionNo: string; // ADM-2026-001

  @ManyToOne(() => Patient, (patient) => patient.admissions)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.admissions)
  @JoinColumn()
  doctor: Staff;

  @Column()
  doctorId: string;

  @ManyToOne(() => Bed, (bed) => bed.admissions)
  @JoinColumn()
  bed: Bed;

  @Column()
  bedId: string;

  @CreateDateColumn()
  admissionDate: Date;

  @Column({ nullable: true })
  dischargeDate: Date;

  @Column({ type: 'enum', enum: AdmissionType })
  admissionType: AdmissionType;

  @Column({ type: 'enum', enum: AdmissionStatus, default: AdmissionStatus.ACTIVE })
  status: AdmissionStatus;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column('simple-array', { nullable: true })
  symptoms: string[];

  @OneToMany(() => ProgressNote, (note) => note.admission)
  progressNotes: ProgressNote[];

  @OneToMany(() => Invoice, (inv) => inv.admission)
  invoices: Invoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/progress-note.entity.ts
// ============================================================
@Entity('progress_notes')
export class ProgressNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admission, (adm) => adm.progressNotes)
  @JoinColumn()
  admission: Admission;

  @Column()
  admissionId: string;

  @Column()
  doctorId: string;

  @Column({ type: 'text' })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/prescription.entity.ts
// ============================================================
@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  prescriptionNo: string; // PRX-2026-001

  @OneToOne(() => Appointment, (apt) => apt.prescription, { nullable: true })
  @JoinColumn()
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Staff, (staff) => staff.prescriptions)
  @JoinColumn()
  doctor: Staff;

  @Column()
  doctorId: string;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'text', nullable: true })
  advice: string;

  @Column({ type: 'date', nullable: true })
  followUpDate: Date;

  @OneToMany(() => PrescriptionMedicine, (pm) => pm.prescription, { cascade: true })
  medicines: PrescriptionMedicine[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/prescription-medicine.entity.ts
// ============================================================
@Entity('prescription_medicines')
export class PrescriptionMedicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, (rx) => rx.medicines, { onDelete: 'CASCADE' })
  @JoinColumn()
  prescription: Prescription;

  @Column()
  prescriptionId: string;

  @ManyToOne(() => Medicine, (med) => med.prescriptionMedicines)
  @JoinColumn()
  medicine: Medicine;

  @Column()
  medicineId: string;

  @Column() // e.g., "1-0-1"
  dosage: string;

  @Column() // e.g., "7 days"
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/medicine.entity.ts
// ============================================================
export enum MedicineCategory {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  OINTMENT = 'ointment',
  CREAM = 'cream',
  DROPS = 'drops',
  INHALER = 'inhaler',
  POWDER = 'powder',
  SUPPOSITORY = 'suppository',
}

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  genericName: string;

  @Column({ nullable: true })
  brandName: string;

  @Column({ type: 'enum', enum: MedicineCategory })
  category: MedicineCategory;

  @Column({ nullable: true })
  manufacturer: string;

  @Column()
  unit: string; // mg, ml, piece

  @Column({ nullable: true })
  strength: string; // "500mg"

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 10 })
  reorderLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  batchNumber: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.medicines, { nullable: true })
  @JoinColumn()
  supplier: Supplier;

  @Column({ nullable: true })
  supplierId: string;

  @OneToMany(() => PrescriptionMedicine, (pm) => pm.medicine)
  prescriptionMedicines: PrescriptionMedicine[];

  @OneToMany(() => InvoiceItem, (item) => item.medicine)
  invoiceItems: InvoiceItem[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/supplier.entity.ts
// ============================================================
@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @OneToMany(() => Medicine, (med) => med.supplier)
  medicines: Medicine[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/lab-test.entity.ts
// ============================================================
export enum LabTestStatus {
  REQUESTED = 'requested',
  SAMPLE_COLLECTED = 'sample_collected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('lab_tests')
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  testNo: string; // LAB-2026-001

  @ManyToOne(() => Patient, (patient) => patient.labTests)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  requestedById: string; // Doctor ID

  @ManyToOne(() => LabTestType, (type) => type.labTests)
  @JoinColumn()
  testType: LabTestType;

  @Column()
  testTypeId: string;

  @Column({ type: 'enum', enum: LabTestStatus, default: LabTestStatus.REQUESTED })
  status: LabTestStatus;

  @Column({ nullable: true })
  sampleType: string; // Blood, Urine, etc.

  @Column({ nullable: true })
  sampleCollectedAt: Date;

  @Column({ nullable: true })
  collectedById: string;

  @Column({ type: 'jsonb', nullable: true })
  results: Record<string, string>; // { hemoglobin: "13.5", wbc: "7000" }

  @Column({ type: 'text', nullable: true })
  resultNotes: string;

  @Column({ nullable: true })
  resultFileUrl: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedById: string;

  @OneToOne(() => InvoiceItem, (item) => item.labTest, { nullable: true })
  invoiceItem: InvoiceItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/lab-test-type.entity.ts
// ============================================================
@Entity('lab_test_types')
export class LabTestType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Complete Blood Count (CBC)

  @Column({ nullable: true })
  nameBn: string;

  @Column()
  category: string; // Hematology, Biochemistry

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  normalRange: Record<string, { min: string; max: string; unit: string }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  turnaroundTime: string; // "2 hours"

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LabTest, (test) => test.testType)
  labTests: LabTest[];

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/invoice.entity.ts
// ============================================================
export enum InvoiceType {
  OPD = 'opd',
  IPD = 'ipd',
  PHARMACY = 'pharmacy',
  LAB = 'lab',
  PACKAGE = 'package',
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PARTIAL_PAID = 'partial_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNo: string; // INV-2026-001

  @ManyToOne(() => Patient, (patient) => patient.invoices)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Admission, (adm) => adm.invoices, { nullable: true })
  @JoinColumn()
  admission: Admission;

  @Column({ nullable: true })
  admissionId: string;

  @Column({ type: 'enum', enum: InvoiceType })
  invoiceType: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  discountReason: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  dueAmount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================
// src/entities/invoice-item.entity.ts
// ============================================================
export enum ItemType {
  CONSULTATION = 'consultation',
  LAB_TEST = 'lab_test',
  MEDICINE = 'medicine',
  ROOM_RENT = 'room_rent',
  PROCEDURE = 'procedure',
  PACKAGE = 'package',
  OTHER = 'other',
}

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ItemType })
  itemType: ItemType;

  @ManyToOne(() => Medicine, (med) => med.invoiceItems, { nullable: true })
  @JoinColumn()
  medicine: Medicine;

  @Column({ nullable: true })
  medicineId: string;

  @OneToOne(() => LabTest, (test) => test.invoiceItem, { nullable: true })
  labTest: LabTest;

  @Column({ nullable: true })
  labTestId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/payment.entity.ts
// ============================================================
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  ROCKET = 'rocket',
  BANK_TRANSFER = 'bank_transfer',
  INSURANCE = 'insurance',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (inv) => inv.payments)
  @JoinColumn()
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  transactionId: string;

  @Column()
  receivedById: string;

  @CreateDateColumn()
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}

// ============================================================
// src/entities/health-package.entity.ts
// ============================================================
@Entity('health_packages')
export class HealthPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameBn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('simple-array')
  testsIncluded: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/notification.entity.ts
// ============================================================
export enum NotificationType {
  APPOINTMENT = 'appointment',
  LAB_RESULT = 'lab_result',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  EMERGENCY = 'emergency',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/audit-log.entity.ts
// ============================================================
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  action: string; // PRESCRIPTION_CREATED, PATIENT_UPDATED

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newData: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ============================================================
// src/entities/setting.entity.ts
// ============================================================
@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ default: 'string' })
  type: string; // string, number, boolean, json
}
```

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Description | Count |
|------|-------------|-------|
| **Super Admin** | System owner, creates hospitals, full access | 1 |
| **Admin** | Hospital manager, staff CRUD, financial oversight | 2-3 |
| **Receptionist** | Front desk, registrations, appointments, billing | 5-10 |
| **Doctor** | Medical consultations, prescriptions, diagnosis | 20-50 |
| **Nurse** | Patient care, vitals, bed management | 30-60 |
| **Lab Technician** | Diagnostic tests, result processing | 10-15 |
| **Pharmacist** | Medicine inventory, dispensing | 5-8 |
| **Accountant** | Invoicing, payments, financial reports | 3-5 |
| **Patient** | External portal user | 1000+ |

### 4.2 Permission Matrix

| Feature | Super Admin | Admin | Receptionist | Doctor | Nurse | Lab Tech | Pharmacist | Accountant | Patient |
|---------|:-----------:|:-----:|:------------:|:------:|:-----:|:--------:|:----------:|:----------:|:-------:|
| **Dashboard** | All | All | Daily queue | My patients | My ward | My tests | My counter | Financial | My data |
| **Patient Registration** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Self-only |
| **View Patient Records** | ✅ | ✅ | ✅ | ✅ (assigned) | ✅ (assigned) | ✅ (test) | ❌ | ❌ | ✅ (own) |
| **Edit Patient Records** | ✅ | ✅ | ✅ (demo) | ✅ (medical) | ✅ (vitals) | ❌ | ❌ | ❌ | ❌ |
| **Create Appointment** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (self) |
| **Manage Doctor Schedule** | ✅ | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Write Prescription** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Prescription** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ (own) |
| **Request Lab Test** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Process Lab Test** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Upload Lab Result** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Manage Pharmacy** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Dispense Medicine** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Bed Management** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create Invoice** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Process Payment** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (online) |
| **Financial Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Staff Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. API Design (REST + Swagger)

### 5.1 Authentication Module

```typescript
// DTOs with class-validator
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  phone: string;
}

// Controller
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT tokens in httpOnly cookies' })
  async login(@Body() dto: LoginDto, @Res() res: Response) { }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and clear cookies' })
  async logout(@Res() res: Response) { }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Req() req: Request, @Res() res: Response) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user with role and permissions' })
  async getMe(@CurrentUser() user: User) { }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body('email') email: string) { }
}
```

### 5.2 Complete API Endpoint List

```
AUTHENTICATION
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/forgot-password
  GET    /api/v1/auth/me

DASHBOARD (role-specific)
  GET    /api/v1/dashboard/admin
  GET    /api/v1/dashboard/doctor
  GET    /api/v1/dashboard/nurse
  GET    /api/v1/dashboard/receptionist
  GET    /api/v1/dashboard/pharmacy
  GET    /api/v1/dashboard/lab
  GET    /api/v1/dashboard/accountant
  GET    /api/v1/dashboard/patient

PATIENTS
  GET    /api/v1/patients
  POST   /api/v1/patients
  GET    /api/v1/patients/:id
  PUT    /api/v1/patients/:id
  GET    /api/v1/patients/:id/history
  GET    /api/v1/patients/:id/appointments
  GET    /api/v1/patients/:id/admissions
  GET    /api/v1/patients/:id/prescriptions
  GET    /api/v1/patients/:id/lab-tests
  GET    /api/v1/patients/:id/invoices

APPOINTMENTS
  GET    /api/v1/appointments
  POST   /api/v1/appointments
  GET    /api/v1/appointments/:id
  PUT    /api/v1/appointments/:id
  PUT    /api/v1/appointments/:id/status
  DELETE /api/v1/appointments/:id
  GET    /api/v1/appointments/today-queue
  GET    /api/v1/appointments/doctor/:doctorId/schedule

VITALS
  POST   /api/v1/appointments/:id/vitals
  GET    /api/v1/appointments/:id/vitals
  PUT    /api/v1/vitals/:id

PRESCRIPTIONS
  GET    /api/v1/prescriptions
  POST   /api/v1/prescriptions
  GET    /api/v1/prescriptions/:id
  GET    /api/v1/prescriptions/:id/pdf
  PUT    /api/v1/prescriptions/:id

LAB TESTS
  GET    /api/v1/lab-tests
  POST   /api/v1/lab-tests
  GET    /api/v1/lab-tests/:id
  PUT    /api/v1/lab-tests/:id/collect
  PUT    /api/v1/lab-tests/:id/start
  PUT    /api/v1/lab-tests/:id/complete
  GET    /api/v1/lab-tests/:id/pdf
  GET    /api/v1/lab-test-types
  POST   /api/v1/lab-test-types

PHARMACY
  GET    /api/v1/medicines
  POST   /api/v1/medicines
  GET    /api/v1/medicines/:id
  PUT    /api/v1/medicines/:id
  PUT    /api/v1/medicines/:id/adjust-stock
  GET    /api/v1/medicines/low-stock
  GET    /api/v1/prescriptions/pending-dispense
  POST   /api/v1/prescriptions/:id/dispense
  GET    /api/v1/suppliers
  POST   /api/v1/suppliers

ADMISSIONS & BEDS
  GET    /api/v1/wards
  GET    /api/v1/wards/:id/beds
  GET    /api/v1/beds
  POST   /api/v1/admissions
  GET    /api/v1/admissions
  GET    /api/v1/admissions/:id
  PUT    /api/v1/admissions/:id/discharge
  PUT    /api/v1/admissions/:id/transfer
  POST   /api/v1/admissions/:id/progress-notes
  GET    /api/v1/bed-availability

BILLING
  GET    /api/v1/invoices
  POST   /api/v1/invoices
  GET    /api/v1/invoices/:id
  PUT    /api/v1/invoices/:id
  POST   /api/v1/invoices/:id/payments
  GET    /api/v1/invoices/:id/pdf
  GET    /api/v1/invoices/daily-collection
  GET    /api/v1/invoices/outstanding

STAFF
  GET    /api/v1/staff
  POST   /api/v1/staff
  GET    /api/v1/staff/:id
  PUT    /api/v1/staff/:id
  PUT    /api/v1/staff/:id/schedule
  GET    /api/v1/staff/:id/schedule
  PUT    /api/v1/staff/:id/activate
  PUT    /api/v1/staff/:id/deactivate

REPORTS
  GET    /api/v1/reports/patient-stats
  GET    /api/v1/reports/revenue
  GET    /api/v1/reports/bed-occupancy
  GET    /api/v1/reports/top-diagnoses
  GET    /api/v1/reports/doctor-performance
  GET    /api/v1/reports/medicine-consumption
  GET    /api/v1/reports/export

SETTINGS & MISC
  GET    /api/v1/settings
  PUT    /api/v1/settings
  GET    /api/v1/departments
  POST   /api/v1/departments
  GET    /api/v1/audit-logs
  GET    /api/v1/notifications
  PUT    /api/v1/notifications/:id/read
  PUT    /api/v1/notifications/read-all
  GET    /api/v1/health-packages
```

---

## 6. Frontend Design System

### 6.1 Design Philosophy

- **Clean & Clinical**: White backgrounds, subtle shadows, generous whitespace
- **Color-Coded Status**: Every status uses consistent colors (green=success, red=danger, amber=warning, blue=info)
- **Card-Based Layout**: Information grouped in rounded cards with subtle borders
- **Progressive Disclosure**: Complex forms use steppers or accordion sections
- **Mobile-First Patient Portal**: Staff dashboards optimized for desktop; patient portal optimized for mobile
- **Bengali Support**: All labels, buttons, and forms support Bangla toggle

### 6.2 Color System

```css
/* Primary Palette */
--primary-50:  #f0fdfa;
--primary-100: #ccfbf1;
--primary-200: #99f6e4;
--primary-300: #5eead4;
--primary-400: #2dd4bf;
--primary-500: #14b8a6;  /* Main brand color */
--primary-600: #0d9488;
--primary-700: #0f766e;  /* Hover states */
--primary-800: #115e59;
--primary-900: #134e4a;

/* Semantic Colors */
--success: #10b981;   /* Available, Completed, Normal */
--warning: #f59e0b;   /* Low stock, Pending, Warning */
--danger:  #ef4444;   /* Critical, Expired, Cancelled */
--info:    #3b82f6;   /* Links, Info badges */

/* Neutral */
--bg-primary:   #ffffff;
--bg-secondary: #f8fafc;  /* Slate-50 */
--bg-tertiary:  #f1f5f9;  /* Slate-100 */
--border:       #e2e8f0;  /* Slate-200 */
--text-primary: #0f172a;  /* Slate-900 */
--text-secondary:#475569; /* Slate-600 */
--text-muted:   #94a3b8;  /* Slate-400 */

/* Dark Mode */
--dark-bg:      #0f172a;
--dark-card:    #1e293b;
--dark-border:  #334155;
--dark-text:    #f8fafc;
```

### 6.3 Typography

```css
/* Font Stack */
--font-sans: 'Inter', 'Noto Sans Bengali', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-xs:   0.75rem;   /* 12px - badges, timestamps */
--text-sm:   0.875rem;  /* 14px - body small, labels */
--text-base: 1rem;      /* 16px - body */
--text-lg:   1.125rem;  /* 18px - subheadings */
--text-xl:   1.25rem;   /* 20px - card titles */
--text-2xl:  1.5rem;    /* 24px - page titles */
--text-3xl:  1.875rem;  /* 30px - dashboard numbers */
--text-4xl:  2.25rem;   /* 36px - hero stats */

/* Weights */
--font-normal:  400;
--font-medium:  500;
--font-semibold:600;
--font-bold:    700;
```

### 6.4 Spacing & Layout

```css
/* Border Radius */
--radius-sm:  0.375rem;  /* 6px  - inputs, small buttons */
--radius-md:  0.5rem;    /* 8px  - cards, modals */
--radius-lg:  0.75rem;   /* 12px - large cards */
--radius-xl:  1rem;      /* 16px - feature cards */
--radius-full: 9999px;   /* pills, avatars */

/* Shadows */
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Sidebar */
--sidebar-width: 280px;
--sidebar-collapsed: 72px;
--header-height: 64px;
```

### 6.5 Component Design Specifications

#### Button Variants
```
Primary:   bg-primary-600 text-white hover:bg-primary-700
Secondary: bg-white border border-border text-text-primary hover:bg-bg-secondary
Danger:    bg-danger text-white hover:bg-red-600
Ghost:     bg-transparent text-text-secondary hover:bg-bg-tertiary
Success:   bg-success text-white hover:bg-emerald-600

Sizes:
  sm:  h-8 px-3 text-sm
  md:  h-10 px-4 text-sm
  lg:  h-12 px-6 text-base
  icon: h-9 w-9 p-0
```

#### Card Design
```
Standard Card:
  bg-white rounded-lg border border-border shadow-sm
  p-6 (padding)
  hover:shadow-md transition-shadow

Stats Card:
  bg-white rounded-xl border border-border
  p-6
  Icon (48px, rounded-xl, colored bg) + Label + Value (text-3xl, bold) + Trend

Data Card (table row):
  bg-white rounded-lg border border-border
  p-4
  hover:bg-bg-secondary transition-colors
```

#### Status Badges
```
scheduled:    bg-blue-50 text-blue-700 border border-blue-200
checked_in:   bg-amber-50 text-amber-700 border border-amber-200
in_progress:  bg-purple-50 text-purple-700 border border-purple-200
completed:    bg-emerald-50 text-emerald-700 border border-emerald-200
cancelled:    bg-red-50 text-red-700 border border-red-200
no_show:      bg-slate-50 text-slate-700 border border-slate-200

available:    bg-emerald-50 text-emerald-700
occupied:     bg-red-50 text-red-700
reserved:     bg-amber-50 text-amber-700
maintenance:  bg-slate-50 text-slate-700

in_stock:     bg-emerald-50 text-emerald-700
low_stock:    bg-amber-50 text-amber-700
out_of_stock: bg-red-50 text-red-700
expired:      bg-red-100 text-red-800
```

#### Form Inputs
```
Standard Input:
  w-full h-10 px-3 rounded-md border border-border
  bg-white text-text-primary
  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
  placeholder:text-text-muted
  disabled:bg-bg-secondary disabled:text-text-muted

Error State:
  border-danger focus:ring-danger focus:border-danger
  + text-danger text-sm mt-1 error message

Label:
  text-sm font-medium text-text-secondary mb-1.5
```

#### Tables
```
Table Container:
  bg-white rounded-lg border border-border overflow-hidden

Table Header:
  bg-bg-secondary border-b border-border
  th: px-4 py-3 text-left text-sm font-semibold text-text-secondary

Table Row:
  border-b border-border last:border-0
  td: px-4 py-3 text-sm text-text-primary
  hover:bg-bg-secondary/50 transition-colors

Selected Row:
  bg-primary-50 border-l-4 border-primary-500
```

#### Modals / Dialogs
```
Overlay:
  fixed inset-0 bg-black/50 backdrop-blur-sm

Modal:
  bg-white rounded-xl shadow-xl
  max-w-lg (or md/lg/xl depending on content)
  p-6

Modal Header:
  flex items-center justify-between mb-4
  Title (text-lg font-semibold) + Close button (X icon)

Modal Footer:
  flex justify-end gap-3 mt-6 pt-4 border-t border-border
```

### 6.6 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (64px)                                                   │
│ ┌────────┬────────────────────────────┬────────┬────────┐      │
│ │ Logo   │ Global Search              │ Notif  │ User   │      │
│ └────────┴────────────────────────────┴────────┴────────┘      │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│ Sidebar  │              Main Content Area                       │
│ (280px)  │                                                      │
│          │  Breadcrumbs / Page Title                            │
│ [Nav     │  ─────────────────────────────────                   │
│  Items]  │                                                      │
│          │  Cards / Tables / Forms / Charts                     │
│          │                                                      │
│          │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

### 6.7 Sidebar Menu by Role

**Admin:**
- Dashboard
- Patients
- Appointments
- Admissions & Beds
- Pharmacy
- Laboratory
- Billing & Invoices
- Staff Management
- Reports & Analytics
- Settings
- Audit Logs

**Doctor:**
- My Dashboard
- My Appointments
- My Patients
- Prescriptions
- Lab Requests
- My Schedule

**Nurse:**
- Dashboard
- Patient Queue
- Vitals Entry
- Bed Management
- Admissions
- My Ward

**Receptionist:**
- Dashboard
- Patient Registration
- Appointments
- Queue Management
- Admissions
- Billing

**Lab Technician:**
- Dashboard
- Pending Tests
- In Progress
- Completed Tests
- Test Types

**Pharmacist:**
- Dashboard
- Pending Prescriptions
- Medicine Inventory
- Suppliers
- Low Stock Alerts

**Accountant:**
- Dashboard
- Invoices
- Payments
- Daily Collection
- Outstanding Bills
- Financial Reports

**Patient (Portal):**
- My Dashboard
- Book Appointment
- My Appointments
- My Prescriptions
- My Lab Reports
- My Bills
- My Profile

### 6.8 Responsive Breakpoints

```
Mobile:     < 640px   (sm)  - Stack everything, hamburger menu
Tablet:     640-1024px (md)  - Collapsible sidebar, 2-col grids
Desktop:    1024-1280px (lg) - Full sidebar, 3-col grids
Large:      > 1280px  (xl)  - Full sidebar, 4-col grids, more data visible
```

### 6.9 Animation Specifications

```
Page Transition:
  duration: 200ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
  effect: fade + slight translateY(8px -> 0)

Modal Open:
  duration: 200ms
  overlay: fade in
  modal: scale(0.95 -> 1) + fade

Toast Notification:
  duration: 300ms
  enter: slide from right + fade
  exit: slide to right + fade
  auto-dismiss: 4000ms

Sidebar Collapse:
  duration: 250ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)

Table Row Hover:
  duration: 150ms
  bg-color transition

Stats Card Number Count:
  duration: 1000ms
  easing: ease-out
  effect: count up from 0
```

---

## 7. Module-by-Module Feature Specs

### 7.1 Authentication & Authorization

**User Story:** As any user, I want to log in securely so that I can access my role-specific dashboard.

**Acceptance Criteria:**
- Login page: clean centered card with email + password fields, hospital logo
- JWT access token (15 min expiry) + refresh token (7 days) stored in httpOnly cookies
- On login, redirect to role-specific dashboard route
- Password reset via email (mock in dev, real SMTP in prod)
- Account lockout after 5 failed attempts (15 min cooldown, stored in Redis)
- "Remember me" option extends refresh token to 30 days
- All API routes protected by NestJS Guards (JwtAuthGuard + RolesGuard)
- `/api/v1/auth/me` returns current user with role, permissions, and preferred language
- Logout clears both cookies and blacklists refresh token in Redis

**Frontend Pages:**
- `/login` — Public, centered layout, dark gradient background, animated logo
- `/forgot-password` — Email input, success message

**API Endpoints:**
```
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
GET  /api/v1/auth/me
```

---

### 7.2 Admin Dashboard

**User Story:** As an Admin, I want to see real-time hospital statistics so I can monitor operations.

**Dashboard Widgets:**

1. **Stats Cards (top row, 6 cards):**
   - Total Patients Today (OPD + IPD) — icon: Users, color: primary
   - Total Appointments Today — icon: Calendar, color: blue
   - Active Admissions (IPD) — icon: Bed, color: purple
   - Total Revenue Today (BDT) — icon: Banknote, color: emerald
   - Pending Lab Tests — icon: FlaskConical, color: amber
   - Low Stock Medicines — icon: Pill, color: red
   - Each card shows: icon (48px rounded bg), label, value (text-3xl bold), trend indicator (+/- % from yesterday)

2. **Charts Section (2x2 grid):**
   - Revenue Trend (area chart, last 30 days, BDT)
   - Patient Visits by Department (horizontal bar chart)
   - Bed Occupancy Rate (donut chart: Available vs Occupied vs Reserved)
   - Top 5 Diagnoses (vertical bar chart)

3. **Tables Section (2 columns):**
   - Recent Admissions (last 10): Patient Name | Bed | Doctor | Admission Date
   - Pending Payments (last 10): Invoice No | Patient | Amount | Due Since
   - Today's Appointment Queue: Token | Patient | Doctor | Status | Time

4. **Quick Actions Bar:**
   - Register New Patient
   - Book Appointment
   - Create Invoice
   - Add Medicine

**Data Refresh:** Auto-refresh every 60 seconds via TanStack Query refetchInterval + Socket.io for critical alerts.

**API Endpoint:** `GET /api/v1/dashboard/admin`

---

### 7.3 Patient Registration & Management

**User Story:** As a Receptionist, I want to register new patients quickly so they can be seen by a doctor.

**Registration Flow:**
1. Click "New Patient" button (primary, with Plus icon)
2. Modal opens with 2-step form:

   **Step 1 — Personal Information:**
   - Full Name (English) — required, text input
   - Full Name (Bengali) — optional, text input
   - Phone — required, pattern validation (01XXXXXXXXX, Bangladesh format)
   - Email — optional, email validation
   - Date of Birth — required, date picker (react-day-picker), auto-calculates age display
   - Gender — required, 3 radio cards (Male/Female/Other) with icons
   - Blood Group — dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-
   - Address — textarea
   - Emergency Contact Name — text input
   - Emergency Contact Phone — text input
   - Upload Photo — drag-and-drop zone, max 2MB, preview thumbnail

   **Step 2 — Medical History:**
   - Allergies — multi-tag input (type and press Enter)
   - Chronic Diseases — multi-tag input
   - Current Medications — multi-tag input
   - Notes — textarea

3. System auto-generates **Patient ID**: format `PAT-YYYY-XXXXX` (e.g., PAT-2026-00001)
4. If phone number already exists, show existing patient card with option to view or create new appointment
5. On save: success toast, patient card is printable (A4 with QR code containing patient ID)
6. Option to "Register & Book Appointment" (skips to appointment booking with patient pre-selected)

**Patient List Page:**
- Search bar (global, searches Patient ID, Name, Phone)
- Filter chips: All | Today | This Week | This Month
- Advanced filters (drawer): Date Range, Department, Doctor, Gender, Age Range
- Data table columns: Photo | Patient ID | Name | Age/Gender | Phone | Last Visit | Actions
- Actions: View (eye icon), Edit (pencil), Print Card (printer), Book Appointment (calendar)
- Pagination: 25/50/100 per page
- Export: CSV, Excel buttons

**Patient Detail View (tabbed interface):**
- **Profile Tab:** Demographics card (photo, name, ID, QR code), contact info, emergency contact, address map
- **Medical History Tab:** Allergies (red badges), chronic diseases (amber badges), current medications (blue badges) — editable by doctor only
- **Appointments Tab:** Timeline view of all appointments with status badges
- **Admissions Tab:** IPD history with bed details and discharge summaries
- **Prescriptions Tab:** All prescriptions with download PDF button
- **Lab Reports Tab:** All test results with download PDF button
- **Billing Tab:** All invoices with payment status and download receipt button

**API Endpoints:**
```
GET    /api/v1/patients?search=&page=&limit=
POST   /api/v1/patients
GET    /api/v1/patients/:id
PUT    /api/v1/patients/:id
GET    /api/v1/patients/:id/history
GET    /api/v1/patients/:id/appointments
GET    /api/v1/patients/:id/admissions
GET    /api/v1/patients/:id/prescriptions
GET    /api/v1/patients/:id/lab-tests
GET    /api/v1/patients/:id/invoices
```

---

### 7.4 Appointment & Queue Management

**User Story:** As a Receptionist, I want to book appointments and manage the daily queue.

**Booking Flow:**
1. Click "Book Appointment" button
2. Stepper form (4 steps):

   **Step 1 — Select Patient:**
   - Search existing patient (dropdown with photo, name, ID, phone)
   - "+ New Patient" button (opens patient registration modal, then returns)
   - Selected patient card shown with photo and basic info

   **Step 2 — Select Department & Doctor:**
   - Department dropdown (with icons)
   - Doctor dropdown (filtered by department, shows photo, name, designation, consultation fee)
   - Doctor availability calendar (mini calendar showing available days in green)

   **Step 3 — Select Date & Time:**
   - Calendar picker (only shows days where doctor has schedule)
   - Time slot grid (morning/afternoon/evening sections, each slot shows "3 slots left")
   - Selected slot highlighted with primary color
   - Shows consultation fee prominently

   **Step 4 — Confirm:**
   - Appointment summary card
   - Chief Complaint textarea
   - Appointment type: OPD / Follow-up / Emergency / Telemedicine
   - "Pay Now" (mock) or "Pay at Hospital" toggle
   - Terms checkbox
   - Book button

3. System generates **Appointment No**: `APT-YYYYMMDD-XXX`
4. Success modal with:
   - Appointment details
   - QR code token
   - "Print Token" button
   - "Send to Phone" button (mock SMS)
   - "Add to Calendar" button

**Queue Management Screen (Receptionist/Nurse):**
- Left sidebar: Today's appointments grouped by status (collapsible sections)
  - Scheduled (not yet arrived) — count badge
  - Checked In (waiting) — count badge with pulse animation
  - In Progress (with doctor) — count badge
  - Completed — count badge
- Main area: Kanban-style board with 4 columns
  - Each card: Token No (large), Patient Name, Age, Gender, Doctor, Chief Complaint, Wait Time
  - Color-coded border by priority (Emergency = red, Urgent = amber, Normal = default)
  - Drag-and-drop between columns (or click action buttons)
  - Nurse clicks "Call Patient" → moves to "In Progress", plays subtle chime sound
  - Doctor clicks "Complete" → moves to completed, triggers OPD billing auto-generation

**Token Display Screen (for waiting room TV):**
- Full-screen view, no sidebar/header
- Large "Now Serving" section with current token number (text-8xl, bold, primary color)
- "Next in Queue" section showing next 5 tokens (text-2xl)
- Current time and date (large)
- Hospital branding at bottom
- Auto-updates via Socket.io every 3 seconds
- Bengali + English labels
- Background: subtle animated gradient

**Doctor's Appointment View:**
- "My Appointments Today" list with timeline
- Each appointment card: Time | Patient | Type | Status | Chief Complaint
- Click patient → opens patient detail sidebar + vitals entry form + prescription writer
- Can mark as "No Show" or "Cancelled" with reason
- Filter: All | Pending | In Progress | Completed

**API Endpoints:**
```
GET    /api/v1/appointments?date=&doctorId=&status=&page=
POST   /api/v1/appointments
GET    /api/v1/appointments/:id
PUT    /api/v1/appointments/:id/status
PUT    /api/v1/appointments/:id
DELETE /api/v1/appointments/:id
GET    /api/v1/appointments/today-queue
GET    /api/v1/appointments/doctor/:doctorId/schedule?date=
```

---

### 7.5 Vitals Entry (Nurse)

**User Story:** As a Nurse, I want to record patient vitals before the doctor sees them.

**Flow:**
1. Nurse dashboard shows "Pending Vitals" queue (patients checked in but vitals not recorded)
2. Queue card shows: Patient Name, Age, Doctor, Time Checked In, Wait Duration
3. Click patient → Vitals Entry Form (modal or side panel):

   **Vitals Form:**
   - Temperature (°C): numeric input, range 30-45, step 0.1, with thermometer icon
   - Blood Pressure: two inputs side by side (systolic/diastolic), pattern validation, with heart icon
   - Pulse Rate (bpm): numeric input, range 30-200, with activity icon
   - SpO2 (%): numeric input, range 70-100, step 0.1, with wind icon
   - Respiratory Rate (per min): numeric input, range 10-60
   - Weight (kg): numeric input, with scale icon
   - Height (cm): numeric input, with ruler icon
   - BMI: auto-calculated display (read-only), shows formula: weight/(height/100)^2

4. **Color-coded alerts:**
   - Red badge: Critical (BP > 180/110, Temp > 40C, SpO2 < 90)
   - Amber badge: Warning (BP > 140/90, Temp > 38C, SpO2 < 95)
   - Green badge: Normal
   - Alert shows specific message: "High Blood Pressure — Alert Doctor Immediately"

5. Save → vitals attached to appointment, visible to doctor in real-time
6. Patient card moves from "Pending Vitals" to "Ready for Doctor"

**API Endpoints:**
```
POST /api/v1/appointments/:id/vitals
GET  /api/v1/appointments/:id/vitals
PUT  /api/v1/vitals/:id
```

---

### 7.6 Prescription Management (Doctor)

**User Story:** As a Doctor, I want to write digital prescriptions quickly with an auto-complete medicine database.

**Prescription Writer Interface:**
- **Left Panel (30% width, sticky):** Patient info card + vitals summary (color-coded) + medical history (allergies highlighted in red) + previous prescriptions (last 3)
- **Right Panel (70% width):** Prescription form

   **Prescription Form:**
   - Chief Complaint: auto-filled from appointment, editable
   - Diagnosis: searchable dropdown with ICD-10 codes + free text option
   - **Medicines Section:**
     - "Add Medicine" button → opens search modal
     - Search modal: search by generic name or brand name
     - Results table: Name | Generic | Strength | Stock | Price | Category
     - On select, medicine row appears with:
       - Medicine name (bold) + strength + category badge
       - Dosage: 3 toggle groups (Morning/Noon/Night), each with 0/0.5/1/2 buttons
       - Duration: number input + unit dropdown (days/weeks/months)
       - Instructions: dropdown (Before meal, After meal, With water, Before sleep) + custom text
       - Quantity: auto-calculated from dosage x duration, editable override
       - Stock availability indicator (green: available, red: insufficient)
       - Delete button (trash icon)
     - Can add unlimited medicines
   - Advice / Notes: rich text textarea
   - Follow-up Date: date picker
   - **Actions:**
     - "Save Draft" (gray button)
     - "Finalize & Print" (primary button)
     - "Finalize & Send to Pharmacy" (success button)

**After Finalization:**
- Prescription gets `PRX-YYYY-XXX` number
- PDF generated server-side with hospital letterhead
- If "Send to Pharmacy": pharmacist receives real-time notification
- Patient portal updated instantly
- Audit log created
- Success toast with "Print" and "View" buttons

**Prescription PDF Layout:**
```
┌─────────────────────────────────────────┐
│ [Hospital Logo]  MediCare Hospital Ltd. │
│ 123 Dhanmondi, Dhaka-1205, Bangladesh   │
│ Phone: +880 2-XXXX-XXXX                 │
├─────────────────────────────────────────┤
│ Date: 21 July 2026    Prescription No:  │
│ Patient: Mohammad Ali (PAT-2026-00001)  │
│ Age: 45 | Gender: Male | Blood: B+      │
├─────────────────────────────────────────┤
│ Dr. Abdullah Al Mamun                   │
│ MBBS, MD (Cardiology)                   │
│ Senior Consultant, Cardiology           │
├─────────────────────────────────────────┤
│ Chief Complaint: Chest pain             │
│ Diagnosis: Hypertension                 │
├─────────────────────────────────────────┤
│ # │ Medicine        │ Dosage │ Duration │
│ 1 │ Amlodipine 5mg  │ 1-0-1  │ 30 days  │
│ 2 │ Metformin 500mg │ 1-0-0  │ 30 days  │
├─────────────────────────────────────────┤
│ Advice: Reduce salt intake, exercise    │
│ Follow-up: 21 August 2026               │
├─────────────────────────────────────────┤
│ [QR Code]  Computer-generated Rx        │
└─────────────────────────────────────────┘
```

**API Endpoints:**
```
GET  /api/v1/prescriptions
POST /api/v1/prescriptions
GET  /api/v1/prescriptions/:id
GET  /api/v1/prescriptions/:id/pdf
PUT  /api/v1/prescriptions/:id
```

---

### 7.7 Lab Test Management

**User Story:** As a Doctor, I want to request lab tests. As a Lab Technician, I want to process them and upload results.

**Doctor Flow (Request Test):**
1. From patient view or prescription screen, click "Request Lab Test" button
2. Modal opens: Multi-select list of Lab Test Types
   - Grouped by category: Hematology, Biochemistry, Microbiology, Radiology, etc.
   - Each test shows: name, price, turnaround time
   - Auto-calculates total price
   - Can select "Urgent" flag (adds red badge, priority processing)
3. Submit → Lab Test records created with status `REQUESTED`
4. Patient can see pending tests in their portal
5. Lab technician receives real-time notification

**Lab Technician Dashboard:**
- 4-column Kanban board: Requested | Sample Collected | In Progress | Completed
- Each card: Test No | Patient Name | Test Name | Requested By | Time | Priority
- Urgent tests have red left border and pulse animation

**Lab Test Processing Flow:**
1. Click "Collect Sample" → status changes to `SAMPLE_COLLECTED`
   - Form: sample type dropdown, collection time (auto-filled), notes
2. Click "Start Processing" → status `IN_PROGRESS`
3. Result Entry Form:
   - Dynamic form based on Test Type's `normalRange` JSON
   - For each parameter: Input field + Unit label + Normal range display
   - Color coding as values are entered:
     - Green: within normal range
     - Red: below min or above max
     - Amber: borderline
   - Notes textarea
   - Upload report PDF (for imaging reports: X-ray, MRI, CT scan)
4. Click "Complete" → status `COMPLETED`, timestamp recorded
5. System auto-generates Lab Report PDF
6. Patient and Doctor receive notification via Socket.io

**Lab Report PDF Layout:**
- Hospital header with logo
- Patient info, Test No, Date, Referring Doctor
- Results table: Parameter | Result | Unit | Normal Range | Status (Normal/High/Low with color badges)
- Technician name, verified by
- Footer with QR code for verification

**API Endpoints:**
```
GET  /api/v1/lab-tests
POST /api/v1/lab-tests
GET  /api/v1/lab-tests/:id
PUT  /api/v1/lab-tests/:id/collect
PUT  /api/v1/lab-tests/:id/start
PUT  /api/v1/lab-tests/:id/complete
GET  /api/v1/lab-tests/:id/pdf
GET  /api/v1/lab-test-types
POST /api/v1/lab-test-types
```

---

### 7.8 Pharmacy & Medicine Inventory

**User Story:** As a Pharmacist, I want to manage medicine stock and dispense prescriptions.

**Medicine Inventory Page:**
- Stats row: Total Medicines | In Stock | Low Stock | Out of Stock | Expiring Soon (30 days)
- Search bar + Filter chips: All | Tablets | Capsules | Syrups | Injections | etc.
- Data table columns: Name | Generic | Category | Stock | Reorder Level | Price | Expiry | Status | Actions
- Status column with colored badges:
  - In Stock (green)
  - Low Stock (amber with alert icon)
  - Out of Stock (red)
  - Expired (red with skull icon)
- Actions: View (eye), Edit (pencil), Adjust Stock (sliders), Delete (trash)
- "Add Medicine" button (primary) → modal form

**Add Medicine Form:**
- Name, Generic Name, Brand Name
- Category: dropdown (Tablet, Capsule, Syrup, Injection, Ointment, Cream, Drops, Inhaler, Powder, Suppository)
- Manufacturer, Strength, Unit
- Stock Quantity, Reorder Level
- Unit Price (cost), Selling Price
- Expiry Date (date picker), Batch Number
- Supplier: dropdown or "+ New Supplier"

**Stock Adjustment:**
- Modal with: Current Stock | Adjustment (+/-) | New Stock (auto-calculated)
- Reason dropdown: Purchase, Return, Damaged, Expired, Correction
- Notes textarea
- Audit log auto-created

**Low Stock Alerts:**
- Badge on Pharmacy menu icon (red dot with count)
- Notification to Admin and Pharmacist
- "Low Stock" page showing all medicines below reorder level
- "Order Suggestions" button (generates purchase order list)

**Dispensing Flow:**
1. Pharmacist sees "Pending Prescriptions" queue
2. Click prescription → shows all medicines with stock availability check
3. For each medicine:
   - Shows requested qty vs available stock
   - If sufficient: checkbox to dispense, auto-fills requested qty
   - If insufficient: shows available qty, marks as "Partial", suggests alternative medicine
   - If out of stock: red warning, must select alternative or mark "Not Available"
4. "Dispense" button → stock deducted, invoice item created (or added to existing OPD invoice)
5. Print dispensing label (small sticker):
   ```
   ┌─────────────────┐
   │ Mohammad Ali    │
   │ Amlodipine 5mg  │
   │ 1-0-1 | 30 days │
   │ After meal      │
   └─────────────────┘
   ```

**API Endpoints:**
```
GET  /api/v1/medicines
POST /api/v1/medicines
GET  /api/v1/medicines/:id
PUT  /api/v1/medicines/:id
PUT  /api/v1/medicines/:id/adjust-stock
GET  /api/v1/medicines/low-stock
GET  /api/v1/prescriptions/pending-dispense
POST /api/v1/prescriptions/:id/dispense
GET  /api/v1/suppliers
POST /api/v1/suppliers
```

---

### 7.9 Bed & Ward Management

**User Story:** As a Receptionist or Nurse, I want to see bed availability and manage admissions.

**Bed Availability Board:**
- Visual floor plan view (grid of wards, each showing beds as cards)
- Top filter bar: Ward Type (All/General/Cabin/ICU/NICU/CCU), Department, Floor, Status
- Each bed card:
  - Bed Number (large, bold)
  - Ward name (small)
  - Daily Rent (BDT)
  - Status indicator (colored dot + label)
  - If occupied: Patient name (truncated), Admission date, Doctor name
  - Hover: tooltip with full details
- Color coding:
  - Green border + bg: Available
  - Red border + bg: Occupied
  - Amber border + bg: Reserved
  - Gray border + bg: Under Maintenance
- Click available bed → "Admit Patient" modal
- Click occupied bed → View admission details, option to discharge or transfer

**Admission Flow:**
1. Select Patient (search with autocomplete)
2. Select Doctor (dropdown with department filter)
3. Select Bed (from availability board, shows rent)
4. Admission Type: Emergency / Planned / Referred (radio cards)
5. Initial Diagnosis / Symptoms (textarea)
6. System generates **Admission No**: `ADM-YYYY-XXX`
7. Bed status changes to `OCCUPIED` in real-time (Socket.io broadcast)
8. Daily room rent auto-added to patient's running bill (background job)

**Discharge Flow:**
1. Doctor initiates discharge (or Admin/Receptionist with doctor approval note)
2. Discharge summary form:
   - Final Diagnosis (text)
   - Treatment Summary (textarea)
   - Discharge Medications (repeater, similar to prescription)
   - Follow-up date (date picker)
   - Discharge type: Normal / Against Medical Advice / Referred / Expired
3. System calculates total IPD bill:
   - Room rent x days
   + All procedures
   + All medicines dispensed
   + All lab tests
   + Doctor visits
4. Final invoice auto-generated with itemized breakdown
5. On payment clearance:
   - Bed status → `AVAILABLE`
   - Admission status → `DISCHARGED`
   - Discharge summary printable
   - Patient receives SMS/email notification (mock)

**Transfer Flow:**
- Transfer patient to another bed/ward
- Reason dropdown: Patient Request, Medical Need, Bed Upgrade, Maintenance
- New bed selection from available beds
- Audit log recorded with old bed -> new bed
- Running bill continues, no interruption

**API Endpoints:**
```
GET  /api/v1/wards
GET  /api/v1/wards/:id/beds
GET  /api/v1/beds
POST /api/v1/admissions
GET  /api/v1/admissions
GET  /api/v1/admissions/:id
PUT  /api/v1/admissions/:id/discharge
PUT  /api/v1/admissions/:id/transfer
POST /api/v1/admissions/:id/progress-notes
GET  /api/v1/bed-availability
```

---

### 7.10 Billing & Invoicing

**User Story:** As a Receptionist or Accountant, I want to create invoices and process payments.

**Invoice Creation:**
- Auto-generated from:
  - OPD: Appointment completion (consultation fee auto-added)
  - IPD: Daily room rent + services (auto-accumulated)
  - Pharmacy: Medicine dispensing (auto-added)
  - Lab: Test completion (auto-added)
- Manual invoice creation for miscellaneous items

**Invoice Detail View:**
- Header card: Invoice No, Date, Patient Info, Status badge (large)
- Items table (editable before payment):
  - Columns: # | Description | Type | Qty | Unit Price (BDT) | Total (BDT) | Actions
  - Can add row: description, type, qty, unit price (auto-calculates total)
  - Can delete row (with confirmation)
  - Discount row: percentage or flat amount input
    - If discount > 20%, requires Admin password (modal prompt)
  - Tax row: percentage input (default from settings)
- Summary card (right sidebar, sticky):
  - Subtotal: BDT X,XXX.00
  - Discount: -BDT XXX.00 (green text)
  - Tax: +BDT XXX.00
  - Total: BDT X,XXX.00 (text-2xl, bold)
  - Paid: BDT X,XXX.00
  - Due: BDT X,XXX.00 (red if > 0)

**Payment Section:**
- Payment Method cards (radio selection):
  - Cash (banknote icon)
  - Card (credit-card icon)
  - bKash (custom icon or phone icon)
  - Nagad (custom icon)
  - Rocket (custom icon)
  - Bank Transfer (landmark icon)
  - Insurance (shield icon)
- Amount input (default = due amount, editable for partial payment)
- Conditional fields:
  - Mobile banking: Transaction ID input
  - Card: Last 4 digits input
  - Insurance: Provider name, Policy number, Claim amount
- "Process Payment" button (primary, disabled if amount > due)
- Payment history table below: Date | Method | Amount | Received By | Transaction ID

**Invoice Actions:**
- Print Invoice (opens PDF in new tab)
- Email Invoice (mock, shows success toast)
- Download PDF
- Cancel Invoice (requires reason, Admin only for paid invoices)
- Refund (partial or full, Accountant + Admin only)

**Invoice PDF Layout:**
- Hospital letterhead (logo, name, address, phone, email, tax ID if applicable)
- Invoice No, Date, Due Date
- Patient Name, Patient ID, Address
- Itemized table with all charges
- Summary: Subtotal, Discount, Tax, Total
- Payment summary: Paid, Due, Payment Method
- "Thank you for choosing MediCare Hospital"
- QR code for online verification
- Footer: "This is a computer-generated invoice."

**Daily Collection Report (Accountant):**
- Date range picker (default: today)
- Summary cards:
  - Total Collection (BDT)
  - Cash
  - Card
  - Mobile Banking (bKash + Nagad + Rocket)
  - Bank Transfer
  - Insurance
- Breakdown table: Time | Invoice No | Patient | Amount | Method | Received By
- Charts: Payment method pie chart, hourly collection bar chart
- Export: Excel, PDF buttons

**Outstanding Bills Report:**
- Table: Invoice No | Patient | Total | Paid | Due | Due Since | Status
- Filter: 0-30 days | 31-60 days | 61-90 days | 90+ days (aging buckets)
- Actions: Send Reminder (mock SMS/email), View, Edit
- Export: Excel

**API Endpoints:**
```
GET  /api/v1/invoices
POST /api/v1/invoices
GET  /api/v1/invoices/:id
PUT  /api/v1/invoices/:id
POST /api/v1/invoices/:id/payments
GET  /api/v1/invoices/:id/pdf
GET  /api/v1/invoices/daily-collection
GET  /api/v1/invoices/outstanding
```

---

### 7.11 Patient Portal (External)

**User Story:** As a Patient, I want to book appointments and view my medical records online.

**Portal Design:**
- Mobile-first, friendly, non-clinical design
- Bottom navigation (mobile): Home | Appointments | Reports | Bills | Profile
- Clean white background with primary teal accents
- Large touch targets, easy-to-read fonts
- Bengali language toggle in header

**Features:**

1. **Registration:**
   - Phone number input → OTP verification (mock: auto-fill "123456")
   - Personal details form (name, DOB, gender, address)
   - Set password
   - Welcome screen with app tour (3 slides)

2. **Book Appointment:**
   - Select Department (card grid with icons)
   - Select Doctor (list with photo, rating, fee, next available slot)
   - Select Date (calendar with available days highlighted)
   - Select Time Slot (list with "Morning/Afternoon/Evening" sections)
   - Shows doctor's fee upfront
   - Chief Complaint textarea
   - "Confirm Booking" → success with QR code token
   - Option to add to phone calendar

3. **My Appointments:**
   - Upcoming (top section, large cards)
   - Past (bottom section, compact list)
   - Each card: Date | Time | Doctor | Department | Status | Token No
   - Actions: Cancel (if > 2 hours before), Reschedule, View Details
   - Cancelled appointments shown in gray with reason

4. **My Prescriptions:**
   - List with date, doctor, diagnosis
   - Tap to view full prescription
   - Download PDF button
   - "Order Medicines" button (mock, links to pharmacy)

5. **My Lab Reports:**
   - List of completed tests
   - Each item: Test Name | Date | Status | Download
   - Tap to view results with normal range comparison
   - Color-coded results (green=normal, red=abnormal)
   - Download PDF report

6. **My Bills:**
   - List of invoices with status (Paid/Pending/Partial)
   - Each item: Invoice No | Date | Total | Paid | Due | Status
   - Tap to view full invoice
   - "Pay Now" button for pending bills (mock payment gateway)
   - Payment methods: bKash, Nagad, Card (mock UI)
   - Download receipt for paid bills

7. **My Profile:**
   - Edit personal info (name, phone, address, emergency contact)
   - View medical history (read-only: allergies, chronic diseases)
   - Change password
   - Language preference (English / Bengali)
   - Notification settings
   - Logout

**API Endpoints (Patient-scoped):**
```
GET /api/v1/dashboard/patient
GET /api/v1/patients/me
PUT /api/v1/patients/me
GET /api/v1/patients/me/appointments
GET /api/v1/patients/me/prescriptions
GET /api/v1/patients/me/lab-tests
GET /api/v1/patients/me/invoices
```

---

### 7.12 Staff Management (Admin)

**User Story:** As an Admin, I want to manage hospital staff and their schedules.

**Staff List Page:**
- Stats row: Total Staff | Doctors | Nurses | Other | Active | Inactive
- Search bar + Filter chips: All | Doctors | Nurses | Lab | Pharmacy | Admin | Inactive
- Data table: Photo | Name | Employee ID | Role | Department | Phone | Joining Date | Status | Actions
- Actions: View (eye), Edit (pencil), Deactivate (toggle), Reset Password (key), View Schedule (calendar)
- "Add Staff" button (primary)

**Add Staff Flow (3-step wizard):**

**Step 1 — Personal Info:**
- Full Name (EN), Full Name (BN)
- Date of Birth (date picker)
- Gender (radio cards)
- Phone (validated)
- Email
- Address (textarea)
- Photo upload (drag-drop, preview)

**Step 2 — Professional Info:**
- Employee ID (auto-generated: EMP-YYYY-XXX, editable)
- Designation (dropdown: Senior Consultant, Consultant, Medical Officer, Staff Nurse, etc.)
- Department (dropdown)
- Role (dropdown: determines permissions)
- If Doctor:
  - Specialization (text)
  - Qualifications (multi-tag input)
  - Experience Years (number)
  - Consultation Fee (BDT)
- If Nurse:
  - Assign Ward (dropdown)

**Step 3 — Account & Schedule:**
- Auto-generate email or use provided
- Set temporary password (auto-generated, shown once)
- If Doctor: Weekly schedule grid
  - Sun-Sat columns
  - Each day: Add time slot button → start time, end time, slot duration, max patients
  - Can mark day as "Off"
  - Can copy schedule from another day
- Send welcome email toggle (mock)

**Doctor Schedule Management:**
- Weekly calendar view (Sun-Sat)
- Each day shows time slots as colored blocks
- Click slot to edit: start time, end time, duration, max patients
- "Mark as Off" toggle per day
- "Copy Week" button (copies current week to next week)
- Patient-facing view shows this schedule for booking

**API Endpoints:**
```
GET  /api/v1/staff
POST /api/v1/staff
GET  /api/v1/staff/:id
PUT  /api/v1/staff/:id
PUT  /api/v1/staff/:id/schedule
GET  /api/v1/staff/:id/schedule
PUT  /api/v1/staff/:id/activate
PUT  /api/v1/staff/:id/deactivate
```

---

### 7.13 Reports & Analytics

**User Story:** As an Admin or Accountant, I want to generate reports for decision-making.

**Report Categories:**

1. **Patient Statistics:**
   - Date range picker
   - Metrics: Total OPD, Total IPD, New Patients, Returning Patients
   - Demographics: Age group pie chart, Gender bar chart, Location map (if address data)
   - Department-wise patient count
   - Export: PDF, Excel

2. **Financial Reports:**
   - Revenue by department (bar chart)
   - Revenue by doctor (for commission — table with doctor name, total revenue, commission %)
   - Revenue by service type (pie chart: consultation, lab, pharmacy, room, procedure)
   - Daily/Monthly/Yearly revenue trend (line chart)
   - Outstanding payments aging report (table: 0-30, 31-60, 61-90, 90+ days)
   - Export: PDF, Excel

3. **Operational Reports:**
   - Bed occupancy rate (trend line, by ward)
   - Average Length of Stay (ALOS) — metric card + trend
   - Top 10 diagnoses (horizontal bar chart)
   - Top 10 prescribed medicines (horizontal bar chart)
   - Lab test turnaround time (average by test type)
   - Doctor utilization rate (% of slots booked vs available)
   - Export: PDF, Excel

4. **Inventory Reports:**
   - Medicine stock valuation (total BDT value)
   - Expiry report (next 30/60/90 days — table with medicine, qty, expiry date, days left)
   - Consumption report (most used medicines — bar chart)
   - Supplier performance (orders, on-time delivery)
   - Export: PDF, Excel

**Report UI:**
- Filter sidebar: Date Range, Department, Doctor, Ward
- "Generate Report" button
- Loading skeleton while generating
- Results: charts + data tables
- "Export" dropdown: PDF, Excel, CSV
- "Schedule Report" button (mock: email report weekly/monthly)

**API Endpoints:**
```
GET /api/v1/reports/patient-stats?from=&to=
GET /api/v1/reports/revenue?from=&to=&groupBy=
GET /api/v1/reports/bed-occupancy?from=&to=
GET /api/v1/reports/top-diagnoses?from=&to=&limit=
GET /api/v1/reports/doctor-performance?from=&to=
GET /api/v1/reports/medicine-consumption?from=&to=
GET /api/v1/reports/export?type=&format=
```

---

### 7.14 Notifications & Communication

**Notification Triggers:**

| Event | Recipients | Channel | Priority |
|-------|-----------|---------|----------|
| Appointment booked | Patient, Receptionist | In-app, Email | Normal |
| Appointment reminder (1hr before) | Patient | In-app, SMS | Normal |
| Patient checked in | Doctor, Nurse | In-app | Normal |
| Vitals recorded (critical) | Doctor | In-app, Urgent badge | High |
| Lab test requested | Lab Technician | In-app | Normal |
| Lab result completed | Patient, Doctor | In-app, Email | Normal |
| Prescription finalized | Patient, Pharmacist | In-app | Normal |
| Medicine low stock | Pharmacist, Admin | In-app, Badge | High |
| Invoice generated | Patient, Accountant | In-app, Email | Normal |
| Payment received | Patient, Accountant | In-app | Normal |
| Admission created | Nurse, Doctor | In-app | Normal |
| Discharge initiated | Receptionist, Accountant | In-app | Normal |
| Emergency admission | All on-duty staff | In-app, Sound alert | Critical |

**Notification UI:**
- Bell icon in header with unread count badge (red dot with number)
- Dropdown panel (max 10 recent, "View All" link)
- Each notification: Icon (colored by type) | Title | Message | Time ago | Unread dot
- Click notification → navigates to relevant page, marks as read
- "Mark All as Read" button
- Notification settings page (toggle types: appointments, lab results, payments, system)

**API Endpoints:**
```
GET  /api/v1/notifications
PUT  /api/v1/notifications/:id/read
PUT  /api/v1/notifications/read-all
```

---

### 7.15 Audit Logs & Data Security

**Audit Log Requirements:**
- Log every CREATE, UPDATE, DELETE on: Patient, Prescription, Invoice, Admission, LabTest, Payment, Staff
- Store: User ID, Action, Entity Type, Entity ID, Old Data (JSON), New Data (JSON), IP Address, Timestamp
- Admin can view audit logs with filters: User (dropdown), Date Range, Entity Type (dropdown), Action (dropdown)
- Table columns: Time | User | Action | Entity | Entity ID | IP Address | View Changes
- "View Changes" button → modal showing diff (old vs new, highlighted)
- Logs are immutable (no edit/delete, even by Super Admin)
- Retention: 2 years (configurable in settings)
- Export: CSV, Excel

**Data Privacy:**
- Patient data encrypted at rest (sensitive fields: phone, email, address)
- Role-based access strictly enforced at API level (NestJS Guards)
- No patient data exposed in URLs (use UUIDs, not sequential IDs)
- Session timeout after 30 minutes of inactivity (auto-logout warning at 25 min)
- Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Rate limiting: 100 requests/minute per IP, 5 login attempts per minute
- CORS: only allow frontend origin
- XSS protection: Content-Security-Policy headers
- SQL injection protection: TypeORM parameterized queries

**API Endpoints:**
```
GET /api/v1/audit-logs?userId=&action=&entityType=&from=&to=&page=
```

---

## 8. Frontend Pages & Components

### 8.1 Page Routes (Next.js App Router)

```
// Public Routes
/login                    — Auth login page
/forgot-password          — Password reset request
/reset-password           — Password reset confirmation

// Staff Routes (protected by role)
/(dashboard)/                    — Role-based redirect
/(dashboard)/admin/              — Admin dashboard
/(dashboard)/doctor/             — Doctor dashboard
/(dashboard)/nurse/              — Nurse dashboard
/(dashboard)/receptionist/       — Receptionist dashboard
/(dashboard)/pharmacy/           — Pharmacy dashboard
/(dashboard)/lab/                — Lab dashboard
/(dashboard)/accountant/         — Accountant dashboard

// Shared Staff Pages
/patients                        — Patient list
/patients/[id]                   — Patient detail (tabbed)
/patients/new                    — New patient registration
/appointments                    — Appointment list
/appointments/new                — Book appointment
/appointments/queue              — Queue management
/prescriptions                   — Prescription list
/prescriptions/[id]              — Prescription detail
/prescriptions/new               — Write prescription
/lab-tests                       — Lab test list
/lab-tests/[id]                  — Lab test detail
/pharmacy/medicines              — Medicine inventory
/pharmacy/dispense               — Dispensing queue
/admissions                      — Admission list
/admissions/beds                 — Bed management board
/billing/invoices                — Invoice list
/billing/invoices/[id]           — Invoice detail
/billing/collection              — Daily collection
/billing/outstanding             — Outstanding bills
/staff                           — Staff list
/staff/[id]                      — Staff detail
/staff/new                       — Add staff
/reports                         — Reports dashboard
/settings                        — System settings
/audit-logs                      — Audit logs
/notifications                   — All notifications

// Patient Portal Routes (separate layout)
/portal                          — Patient dashboard
/portal/appointments             — My appointments
/portal/appointments/new         — Book appointment
/portal/prescriptions            — My prescriptions
/portal/lab-reports              — My lab reports
/portal/bills                    — My bills
/portal/profile                  — My profile

// Display Routes (for TV screens)
/display/queue                   — Token display screen
```

### 8.2 Key Components

```typescript
// Layout Components
components/layout/
  ├── Sidebar.tsx              — Collapsible sidebar with role-based menu
  ├── Header.tsx               — Top bar with search, notifications, user menu
  ├── Layout.tsx               — Main layout wrapper (sidebar + content)
  ├── PatientPortalLayout.tsx  — Mobile-first layout for patient portal
  ├── DisplayLayout.tsx        — Full-screen layout for TV display

// Common Components
components/common/
  ├── DataTable.tsx            — Reusable sortable/filterable table
  ├── SearchBar.tsx            — Global search with debounce
  ├── StatCard.tsx             — Dashboard stat card with icon + trend
  ├── StatusBadge.tsx          — Color-coded status badge
  ├── ConfirmDialog.tsx        — Reusable confirmation modal
  ├── EmptyState.tsx           — Empty state illustration + message
  ├── LoadingSkeleton.tsx      — Skeleton loader for cards/tables
  ├── PageHeader.tsx           — Breadcrumbs + title + actions
  ├── FilterDrawer.tsx         — Slide-out filter panel
  ├── DateRangePicker.tsx      — Date range selection
  ├── FileUpload.tsx           — Drag-drop file upload with preview
  ├── LanguageToggle.tsx       — EN/BN language switcher
  ├── ThemeToggle.tsx          — Light/dark mode toggle
  └── PrintButton.tsx          — Print trigger with loading state

// Patient Components
components/patient/
  ├── PatientForm.tsx          — Multi-step patient registration
  ├── PatientCard.tsx          — Compact patient info card
  ├── PatientDetail.tsx        — Tabbed patient detail view
  ├── PatientSearch.tsx        — Autocomplete patient search
  └── PatientIdCard.tsx        — Printable patient ID card

// Appointment Components
components/appointment/
  ├── AppointmentCalendar.tsx  — Doctor availability calendar
  ├── AppointmentCard.tsx      — Appointment card for lists
  ├── QueueBoard.tsx           — Kanban queue board
  ├── QueueCard.tsx            — Individual queue card
  ├── TokenDisplay.tsx         — TV display for token numbers
  ├── TimeSlotGrid.tsx         — Time slot selection grid
  └── BookingWizard.tsx        — Multi-step booking form

// Prescription Components
components/prescription/
  ├── PrescriptionWriter.tsx   — Main prescription form
  ├── MedicineSearch.tsx       — Medicine search modal
  ├── MedicineRow.tsx          — Individual medicine row
  ├── DosageSelector.tsx       — Morning/Noon/Night toggle
  ├── PrescriptionPreview.tsx  — PDF preview modal
  └── PrescriptionList.tsx     — List of prescriptions

// Lab Components
components/lab/
  ├── TestRequestForm.tsx      — Lab test request modal
  ├── TestResultForm.tsx       — Dynamic result entry form
  ├── TestResultViewer.tsx     — Result display with normal range
  ├── LabReportViewer.tsx      — PDF report viewer
  ├── TestTypeForm.tsx         — Add/edit test type
  └── TestStatusBoard.tsx      — Kanban board for test statuses

// Pharmacy Components
components/pharmacy/
  ├── MedicineInventory.tsx    — Medicine grid/table
  ├── MedicineForm.tsx         — Add/edit medicine form
  ├── StockAdjustmentModal.tsx — Stock adjustment dialog
  ├── DispenseQueue.tsx        — Pending prescriptions list
  ├── DispenseForm.tsx         — Medicine dispensing form
  ├── LowStockAlert.tsx        — Low stock notification banner
  └── SupplierForm.tsx         — Add/edit supplier

// Bed Components
components/bed/
  ├── BedAvailabilityBoard.tsx — Visual bed grid
  ├── BedCard.tsx              — Individual bed card
  ├── WardMap.tsx              — Floor plan visualization
  ├── AdmissionForm.tsx        — New admission form
  ├── DischargeForm.tsx        — Discharge summary form
  ├── TransferModal.tsx        — Bed transfer dialog
  └── ProgressNoteForm.tsx     — Daily progress note entry

// Billing Components
components/billing/
  ├── InvoiceForm.tsx          — Invoice creation/editing
  ├── InvoiceDetail.tsx        — Invoice detail view
  ├── PaymentModal.tsx         — Payment processing modal
  ├── PaymentMethodCards.tsx   — Payment method selection
  ├── DailyCollectionReport.tsx — Collection report view
  ├── OutstandingBills.tsx     — Aging report view
  └── InvoicePdfViewer.tsx     — PDF preview

// Dashboard Components
components/dashboard/
  ├── StatsGrid.tsx            — Grid of stat cards
  ├── RevenueChart.tsx         — Revenue trend chart
  ├── DepartmentChart.tsx      — Department visits chart
  ├── BedOccupancyChart.tsx    — Bed occupancy donut
  ├── DiagnosisChart.tsx       — Top diagnoses bar chart
  ├── RecentAdmissions.tsx     — Recent admissions table
  ├── PendingPayments.tsx      — Pending payments table
  └── TodaysQueue.tsx          — Today's appointment queue

// Chart Components (Recharts wrappers)
components/charts/
  ├── AreaChart.tsx
  ├── BarChart.tsx
  ├── LineChart.tsx
  ├── PieChart.tsx
  ├── DonutChart.tsx
  └── HorizontalBarChart.tsx
```

---

## 9. Real-Time Features (WebSockets)

### 9.1 NestJS WebSocket Gateway

```typescript
// src/gateways/notifications.gateway.ts
@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: process.env.FRONTEND_URL },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  handleConnection(client: Socket) {
    // Authenticate via JWT from handshake auth
    const token = client.handshake.auth.token;
    // Verify token, extract userId
    // Store socket mapping
  }

  handleDisconnect(client: Socket) {
    // Remove socket mapping
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(id => {
        this.server.to(id).emit(event, data);
      });
    }
  }

  // Broadcast to room (e.g., all receptionists)
  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
```

### 9.2 Real-Time Events

| Event Name | Trigger | Payload | Recipients |
|-----------|---------|---------|------------|
| `appointment:created` | New booking | Appointment object | Receptionists, Patient |
| `appointment:status-changed` | Status update | { id, status, patient } | Doctor, Nurse, Patient |
| `patient:checked-in` | Check-in | { patient, doctor, token } | Doctor, Nurse |
| `vitals:recorded` | Vitals saved | { patient, vitals, alert? } | Doctor |
| `prescription:finalized` | Rx completed | { prescription, patient } | Patient, Pharmacist |
| `lab:test-requested` | Test ordered | { test, patient } | Lab technicians |
| `lab:test-completed` | Results ready | { test, patient, results } | Patient, Doctor |
| `pharmacy:low-stock` | Stock below threshold | { medicine, currentStock } | Pharmacist, Admin |
| `bed:status-changed` | Bed occupied/available | { bedId, status, patient? } | All staff |
| `invoice:created` | New invoice | { invoice, patient } | Accountant, Patient |
| `payment:received` | Payment processed | { payment, invoice } | Patient, Accountant |
| `notification:new` | Any notification | Notification object | Target user |
| `queue:updated` | Queue changes | { queue } | All viewing queue page |
| `token:now-serving` | Token called | { tokenNo, patient, doctor } | Display screens |

### 9.3 Frontend Socket Hook

```typescript
// hooks/useSocket.ts
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

let socket: Socket | null = null;

export function useSocket() {
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      // Join role-based room
      socket?.emit('join:room', `role:${user.role}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token, user]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
    return () => socket?.off(event, callback);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, []);

  return { socket, on, emit };
}
```

---

## 10. File Storage & PDF Generation

### 10.1 File Upload (Prescriptions, Lab Reports, Patient Photos)

**NestJS File Upload:**
```typescript
// Using @nestjs/platform-express Multer
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
      return cb(new BadRequestException('Only images and PDFs allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { url: `/uploads/${file.filename}` };
}
```

**Production:** Use AWS S3 or Cloudflare R2 with pre-signed URLs.

### 10.2 PDF Generation (Puppeteer)

```typescript
// src/services/pdf.service.ts
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private browser: puppeteer.Browser;

  async onModuleInit() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
    const page = await this.browser.newPage();

    const html = this.getPrescriptionTemplate(data);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await page.close();
    return pdf;
  }

  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> { }
  async generateLabReportPdf(data: LabReportPdfData): Promise<Buffer> { }
  async generatePatientIdCard(data: PatientIdData): Promise<Buffer> { }

  private getPrescriptionTemplate(data: PrescriptionPdfData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { color: #0f766e; margin: 0; font-size: 24px; }
          .header p { color: #64748b; margin: 4px 0; font-size: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-item { font-size: 12px; }
          .info-item strong { color: #0f172a; }
          .section-title { color: #0f766e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f0fdfa; color: #0f766e; text-align: left; padding: 8px; border-bottom: 2px solid #0f766e; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; }
          .qr { text-align: center; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediCare Hospital Ltd.</h1>
          <p>123 Dhanmondi, Dhaka-1205, Bangladesh</p>
          <p>Phone: +880 2-XXXX-XXXX | Email: info@medicare.com</p>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-item"><strong>Date:</strong> ${data.date}</div>
            <div class="info-item"><strong>Prescription No:</strong> ${data.prescriptionNo}</div>
            <div class="info-item"><strong>Patient:</strong> ${data.patientName}</div>
            <div class="info-item"><strong>Age:</strong> ${data.patientAge} | <strong>Gender:</strong> ${data.patientGender}</div>
          </div>
          <div>
            <div class="info-item"><strong>Doctor:</strong> ${data.doctorName}</div>
            <div class="info-item"><strong>Department:</strong> ${data.department}</div>
            <div class="info-item"><strong>Patient ID:</strong> ${data.patientId}</div>
          </div>
        </div>

        <div class="section-title">Chief Complaint</div>
        <p style="font-size: 12px; margin-bottom: 24px;">${data.chiefComplaint}</p>

        <div class="section-title">Diagnosis</div>
        <p style="font-size: 12px; margin-bottom: 24px;">${data.diagnosis}</p>

        <div class="section-title">Medicines</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${data.medicines.map((m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${m.name} ${m.strength}</td>
                <td>${m.dosage}</td>
                <td>${m.duration}</td>
                <td>${m.instructions}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title" style="margin-top: 24px;">Advice</div>
        <p style="font-size: 12px;">${data.advice}</p>

        <div style="margin-top: 24px; font-size: 12px;">
          <strong>Follow-up Date:</strong> ${data.followUpDate || 'N/A'}
        </div>

        <div class="qr">
          <img src="${data.qrCodeUrl}" width="100" height="100" />
          <p style="font-size: 10px;">Scan to verify prescription</p>
        </div>

        <div class="footer">
          This is a computer-generated prescription. No signature required.<br>
          MediCare Hospital Ltd. | All rights reserved.
        </div>
      </body>
      </html>
    `;
  }
}
```

### 10.3 PDF Endpoints

```typescript
@Get(':id/pdf')
@ApiOperation({ summary: 'Download prescription as PDF' })
@ApiProduces('application/pdf')
async downloadPdf(@Param('id') id: string, @Res() res: Response) {
  const prescription = await this.prescriptionService.findOne(id);
  const pdfBuffer = await this.pdfService.generatePrescriptionPdf(prescription);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="prescription-${prescription.prescriptionNo}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.end(pdfBuffer);
}
```

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Project scaffolding (NestJS + Next.js monorepo or separate repos)
- [ ] Docker Compose setup (PostgreSQL, Redis, backend, frontend, nginx)
- [ ] Database schema implementation (TypeORM entities + migrations)
- [ ] Authentication system (JWT, bcrypt, httpOnly cookies, guards)
- [ ] Role-based access control (RolesGuard, @Roles decorator)
- [ ] Basic layout (sidebar, header, routing by role)
- [ ] API documentation setup (Swagger)
- [ ] Seed script with demo data (20 doctors, 50 patients, 100 medicines, 30 lab tests)

**Deliverable:** Working login, role-based redirect, empty dashboard pages, Swagger docs at `/api/docs`

### Phase 2: Core Patient & Appointment (Week 2)
- [ ] Patient registration form (multi-step, with validation)
- [ ] Patient list with search, filters, pagination
- [ ] Patient detail view (tabbed interface)
- [ ] Doctor schedule management (weekly calendar)
- [ ] Appointment booking wizard (4-step)
- [ ] Queue management (Kanban board)
- [ ] Token display screen (TV mode)
- [ ] Vitals entry form (nurse)
- [ ] Patient portal basic (view appointments)

**Deliverable:** Full patient registration, appointment booking, queue management, vitals entry

### Phase 3: Medical Records (Week 3)
- [ ] Prescription writer with medicine database search
- [ ] Prescription PDF generation (Puppeteer)
- [ ] Lab test request (doctor)
- [ ] Lab test processing workflow (lab tech)
- [ ] Lab result entry with dynamic forms
- [ ] Lab report PDF generation
- [ ] Patient portal: prescriptions & lab reports

**Deliverable:** End-to-end prescription and lab test workflow with PDF generation

### Phase 4: IPD & Pharmacy (Week 4)
- [ ] Ward & bed management (visual board with color-coded beds)
- [ ] Admission workflow (form + bed assignment)
- [ ] Discharge workflow (summary + final bill)
- [ ] Bed transfer functionality
- [ ] Pharmacy inventory (CRUD, stock alerts)
- [ ] Medicine dispensing workflow
- [ ] Patient portal: bills view

**Deliverable:** Full IPD management, pharmacy inventory, dispensing

### Phase 5: Billing & Reports (Week 5)
- [ ] Invoice generation (auto from services + manual)
- [ ] Payment processing (multi-method)
- [ ] Invoice PDF generation
- [ ] Daily collection report
- [ ] Outstanding bills (aging report)
- [ ] Admin dashboard with charts (Recharts)
- [ ] Financial reports (revenue, department-wise)
- [ ] Operational reports (bed occupancy, top diagnoses)
- [ ] Audit logs viewer

**Deliverable:** Complete billing system, reports, analytics dashboard

### Phase 6: Polish & Deploy (Week 6)
- [ ] Real-time notifications (Socket.io)
- [ ] Bengali language toggle (next-intl)
- [ ] Dark mode support
- [ ] Mobile responsiveness (patient portal)
- [ ] Animations (Framer Motion)
- [ ] Performance optimization (React.memo, code splitting)
- [ ] Error boundaries and loading states
- [ ] Form validation polish (Zod schemas)
- [ ] README with setup instructions
- [ ] Demo data refinement (realistic Bangladeshi names, addresses)
- [ ] Demo video/GIF for CV
- [ ] Deploy to VPS / Railway / Render

**Deliverable:** Production-ready application, deployed, with demo video

---

## 12. Project Structure

```
medicare-hms/
├── docker-compose.yml
├── README.md
├── .env.example
├── Makefile
│
├── backend/                          # NestJS Application
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── ormconfig.ts                  # TypeORM config
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── swagger.config.ts
│   │   │
│   │   ├── common/                   # Shared utilities
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   └── utils/
│   │   │       ├── generate-id.util.ts
│   │   │       └── logger.util.ts
│   │   │
│   │   ├── entities/                 # TypeORM entities (all 20+)
│   │   │   ├── user.entity.ts
│   │   │   ├── staff.entity.ts
│   │   │   ├── patient.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   ├── ward.entity.ts
│   │   │   ├── bed.entity.ts
│   │   │   ├── doctor-schedule.entity.ts
│   │   │   ├── appointment.entity.ts
│   │   │   ├── vitals.entity.ts
│   │   │   ├── admission.entity.ts
│   │   │   ├── progress-note.entity.ts
│   │   │   ├── prescription.entity.ts
│   │   │   ├── prescription-medicine.entity.ts
│   │   │   ├── medicine.entity.ts
│   │   │   ├── supplier.entity.ts
│   │   │   ├── lab-test.entity.ts
│   │   │   ├── lab-test-type.entity.ts
│   │   │   ├── invoice.entity.ts
│   │   │   ├── invoice-item.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   ├── health-package.entity.ts
│   │   │   ├── notification.entity.ts
│   │   │   ├── audit-log.entity.ts
│   │   │   └── setting.entity.ts
│   │   │
│   │   ├── modules/                  # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   └── refresh-token.dto.ts
│   │   │   │   └── strategies/
│   │   │   │       ├── jwt.strategy.ts
│   │   │   │       └── jwt-refresh.strategy.ts
│   │   │   │
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── prescriptions/
│   │   │   ├── lab-tests/
│   │   │   ├── pharmacy/
│   │   │   ├── admissions/
│   │   │   ├── billing/
│   │   │   ├── staff/
│   │   │   ├── reports/
│   │   │   ├── dashboard/
│   │   │   ├── notifications/
│   │   │   ├── audit-logs/
│   │   │   └── settings/
│   │   │       Each module contains:
│   │   │       ├── *.module.ts
│   │   │       ├── *.controller.ts
│   │   │       ├── *.service.ts
│   │   │       ├── dto/
│   │   │       │   ├── create-*.dto.ts
│   │   │       │   ├── update-*.dto.ts
│   │   │       │   └── query-*.dto.ts
│   │   │       └── entities/ (if not in shared)
│   │   │
│   │   ├── gateways/                 # WebSocket gateways
│   │   │   └── notifications.gateway.ts
│   │   │
│   │   ├── services/                 # Shared services
│   │   │   ├── pdf.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   └── seeds/                    # Database seeding
│   │       ├── seed.module.ts
│   │       ├── seed.service.ts
│   │       └── data/
│   │           ├── departments.seed.ts
│   │           ├── doctors.seed.ts
│   │           ├── patients.seed.ts
│   │           ├── medicines.seed.ts
│   │           └── lab-tests.seed.ts
│   │
│   ├── uploads/                      # File storage (dev)
│   └── test/
│       ├── jest-e2e.json
│       └── e2e/
│           └── auth.e2e-spec.ts
│
├── frontend/                         # Next.js Application
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── middleware.ts                 # Next.js middleware for auth
│   │
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing/redirect page
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (auth)/               # Auth group (no sidebar)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── forgot-password/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── (dashboard)/          # Staff dashboard group
│   │   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   │   ├── page.tsx          # Role-based redirect
│   │   │   │   ├── admin/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── doctor/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── nurse/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── receptionist/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pharmacy/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── lab/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── accountant/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── queue/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── prescriptions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── lab-tests/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── pharmacy/
│   │   │   │   ├── medicines/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── dispense/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── admissions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── beds/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── collection/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── outstanding/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── portal/             # Patient Portal
│   │   │   │   ├── layout.tsx      # Portal layout (mobile-first)
│   │   │   │   ├── page.tsx        # Portal dashboard
│   │   │   │   ├── appointments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── prescriptions/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── lab-reports/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── bills/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── display/
│   │   │       └── queue/
│   │   │           └── page.tsx
│   │   │
│   │   ├── components/             # React Components
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── PatientPortalLayout.tsx
│   │   │   │   └── DisplayLayout.tsx
│   │   │   ├── common/
│   │   │   ├── patient/
│   │   │   ├── appointment/
│   │   │   ├── prescription/
│   │   │   ├── lab/
│   │   │   ├── pharmacy/
│   │   │   ├── bed/
│   │   │   ├── billing/
│   │   │   ├── dashboard/
│   │   │   └── charts/
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── usePatients.ts
│   │   │   ├── useAppointments.ts
│   │   │   ├── usePrescriptions.ts
│   │   │   ├── useLabTests.ts
│   │   │   ├── useMedicines.ts
│   │   │   ├── useAdmissions.ts
│   │   │   ├── useInvoices.ts
│   │   │   ├── useStaff.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useDashboard.ts
│   │   │
│   │   ├── stores/                 # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── sidebarStore.ts
│   │   │   ├── themeStore.ts
│   │   │   └── notificationStore.ts
│   │   │
│   │   ├── lib/                    # Utilities
│   │   │   ├── api.ts              # Axios instance with interceptors
│   │   │   ├── socket.ts           # Socket.io client setup
│   │   │   ├── utils.ts            # Helper functions
│   │   │   ├── constants.ts        # App constants
│   │   │   └── validations.ts      # Zod schemas
│   │   │
│   │   ├── types/                  # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── i18n/                   # Internationalization
│   │   │   ├── config.ts
│   │   │   ├── messages/
│   │   │   │   ├── en.json
│   │   │   │   └── bn.json
│   │   │   └── locales/
│   │   │       ├── en.ts
│   │   │       └── bn.ts
│   │   │
│   │   └── styles/
│   │       └── animations.css
│   │
│   ├── public/
│   │   ├── assets/
│   │   │   ├── logo.png
│   │   │   ├── logo-dark.png
│   │   │   └── empty-state.svg
│   │   └── favicon.ico
│   │
│   └── test/
│       └── setup.ts
│
└── shared/                         # Shared code (optional monorepo)
    ├── types/
    │   └── index.ts               # Shared TypeScript types
    └── schemas/
        └── index.ts               # Shared Zod schemas
```

---

## 13. Environment Configuration

### 13.1 Backend .env

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=medicare_hms
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medicare_hms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@medicarehospital.com
FROM_NAME=MediCare Hospital

# SMS (Twilio or Bangladeshi provider)
SMS_PROVIDER=twilio
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# Hospital Info (used in PDFs and emails)
HOSPITAL_NAME=MediCare Hospital Ltd.
HOSPITAL_NAME_BN=মেডিকেয়ার হাসপাতাল লিমিটেড
HOSPITAL_ADDRESS=123 Dhanmondi, Dhaka-1205, Bangladesh
HOSPITAL_PHONE=+880 2-XXXX-XXXX
HOSPITAL_EMAIL=info@medicarehospital.com
HOSPITAL_LOGO_URL=/assets/logo.png

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 13.2 Frontend .env

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=MediCare HMS
NEXT_PUBLIC_APP_NAME_BN=মেডিকেয়ার HMS
NEXT_PUBLIC_CURRENCY=BDT
NEXT_PUBLIC_CURRENCY_SYMBOL=৳

# Features
NEXT_PUBLIC_ENABLE_BN=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

---

## 14. Deployment Guide

### 14.1 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: medicare-postgres
    environment:
      POSTGRES_DB: medicare_hms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: medicare-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    container_name: medicare-backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/medicare_hms
      REDIS_HOST: redis
      JWT_SECRET: dev-secret-key
      JWT_REFRESH_SECRET: dev-refresh-secret
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    command: npm run start:dev

  frontend:
    build: ./frontend
    container_name: medicare-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000/api/v1
      NEXT_PUBLIC_WS_URL: http://localhost:5000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    command: npm run dev

  nginx:
    image: nginx:alpine
    container_name: medicare-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 14.2 Production Deployment Checklist

- [ ] Change all default passwords and secrets
- [ ] Use PostgreSQL with SSL
- [ ] Use Redis with AUTH password
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set up PM2 or systemd for process management
- [ ] Configure log rotation (winston + logrotate)
- [ ] Set up database backups (daily automated)
- [ ] Configure rate limiting
- [ ] Enable CORS only for production domain
- [ ] Set up monitoring (Prometheus + Grafana or Sentry)
- [ ] Use S3/Cloudflare R2 for file storage
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline (GitHub Actions)

---

## 15. Demo Data Seeding

### 15.1 Departments (15)

```typescript
const departments = [
  { name: 'Cardiology', nameBn: 'হৃদরোগ', icon: 'Heart', description: 'Heart and cardiovascular system' },
  { name: 'Neurology', nameBn: 'স্নায়ুরোগ', icon: 'Brain', description: 'Brain and nervous system' },
  { name: 'Orthopedics', nameBn: 'অস্থিরোগ', icon: 'Bone', description: 'Bones and joints' },
  { name: 'Gastroenterology', nameBn: 'পাচনতন্ত্র', icon: 'Stomach', description: 'Digestive system' },
  { name: 'Pediatrics', nameBn: 'শিশুরোগ', icon: 'Baby', description: 'Children health' },
  { name: 'Gynecology & Obstetrics', nameBn: 'স্ত্রীরোগ ও প্রসূতি', icon: 'Users', description: 'Women health and pregnancy' },
  { name: 'Dermatology', nameBn: 'চর্মরোগ', icon: 'Sparkles', description: 'Skin conditions' },
  { name: 'ENT', nameBn: 'কান নাক গলা', icon: 'Ear', description: 'Ear, nose, throat' },
  { name: 'Ophthalmology', nameBn: 'চক্ষুরোগ', icon: 'Eye', description: 'Eye care' },
  { name: 'Urology', nameBn: 'মূত্রনালী', icon: 'Droplets', description: 'Urinary system' },
  { name: 'Nephrology', nameBn: 'কিডনি', icon: 'Kidney', description: 'Kidney care' },
  { name: 'Oncology', nameBn: 'ক্যান্সার', icon: 'Ribbon', description: 'Cancer treatment' },
  { name: 'Psychiatry', nameBn: 'মানসিক স্বাস্থ্য', icon: 'BrainCircuit', description: 'Mental health' },
  { name: 'Dental', nameBn: 'দন্তরোগ', icon: 'Smile', description: 'Dental care' },
  { name: 'Emergency Medicine', nameBn: 'জরুরি চিকিৎসা', icon: 'Siren', description: 'Emergency care' },
];
```

### 15.2 Doctors (20) — Realistic Bangladeshi Names

```typescript
const doctors = [
  { fullName: 'Dr. Abdullah Al Mamun', fullNameBn: 'ডা. আবদুল্লাহ আল মামুন', specialization: 'Cardiology', qualifications: ['MBBS (DMC)', 'MD (Cardiology)', 'FACC (USA)'], experienceYears: 15, consultationFee: 1500 },
  { fullName: 'Dr. Fatema Begum', fullNameBn: 'ডা. ফাতেমা বেগম', specialization: 'Gynecology', qualifications: ['MBBS (SSMC)', 'FCPS (OBGYN)', 'MRCOG (UK)'], experienceYears: 12, consultationFee: 1200 },
  { fullName: 'Dr. Kamal Hossain', fullNameBn: 'ডা. কামাল হোসেন', specialization: 'Orthopedics', qualifications: ['MBBS (RMC)', 'MS (Ortho)', 'Fellowship (Singapore)'], experienceYears: 18, consultationFee: 1000 },
  { fullName: 'Dr. Nasreen Sultana', fullNameBn: 'ডা. নাসরিন সুলতানা', specialization: 'Pediatrics', qualifications: ['MBBS (DMC)', 'MD (Pediatrics)', 'MRCPCH (UK)'], experienceYears: 10, consultationFee: 800 },
  { fullName: 'Dr. Rafiqul Islam', fullNameBn: 'ডা. রফিকুল ইসলাম', specialization: 'Neurology', qualifications: ['MBBS (SSMC)', 'MD (Neurology)', 'Fellowship (India)'], experienceYears: 14, consultationFee: 1300 },
  { fullName: 'Dr. Sharmin Akter', fullNameBn: 'ডা. শারমিন আক্তার', specialization: 'Dermatology', qualifications: ['MBBS (DMC)', 'FCPS (Dermatology)'], experienceYears: 8, consultationFee: 700 },
  { fullName: 'Dr. Mohammad Ali', fullNameBn: 'ডা. মোহাম্মদ আলী', specialization: 'Gastroenterology', qualifications: ['MBBS (RMC)', 'MD (Gastro)', 'MRCP (UK)'], experienceYears: 16, consultationFee: 1100 },
  { fullName: 'Dr. Sajeda Khatun', fullNameBn: 'ডা. সাজেদা খাতুন', specialization: 'Ophthalmology', qualifications: ['MBBS (DMC)', 'FCPS (Ophthalmology)', 'FRCS (Glasgow)'], experienceYears: 11, consultationFee: 900 },
  { fullName: 'Dr. Rahim Uddin', fullNameBn: 'ডা. রহিম উদ্দিন', specialization: 'Urology', qualifications: ['MBBS (SSMC)', 'MS (Urology)', 'Fellowship (Germany)'], experienceYears: 13, consultationFee: 1000 },
  { fullName: 'Dr. Tahmina Rahman', fullNameBn: 'ডা. তাহমিনা রহমান', specialization: 'Nephrology', qualifications: ['MBBS (DMC)', 'MD (Nephrology)'], experienceYears: 9, consultationFee: 1000 },
  { fullName: 'Dr. Anisur Rahman', fullNameBn: 'ডা. আনিসুর রহমান', specialization: 'Oncology', qualifications: ['MBBS (RMC)', 'MD (Oncology)', 'Fellowship (USA)'], experienceYears: 17, consultationFee: 1500 },
  { fullName: 'Dr. Farhana Islam', fullNameBn: 'ডা. ফারহানা ইসলাম', specialization: 'Psychiatry', qualifications: ['MBBS (DMC)', 'MD (Psychiatry)'], experienceYears: 7, consultationFee: 600 },
  { fullName: 'Dr. Mahmudul Hasan', fullNameBn: 'ডা. মাহমুদুল হাসান', specialization: 'ENT', qualifications: ['MBBS (SSMC)', 'MS (ENT)', 'FRCS (Edinburgh)'], experienceYears: 12, consultationFee: 800 },
  { fullName: 'Dr. Rehana Parvin', fullNameBn: 'ডা. রেহানা পারভিন', specialization: 'Dental', qualifications: ['BDS (DMC)', 'MDS (Orthodontics)'], experienceYears: 6, consultationFee: 500 },
  { fullName: 'Dr. Abdul Kader', fullNameBn: 'ডা. আবদুল কাদের', specialization: 'Emergency Medicine', qualifications: ['MBBS (DMC)', 'FCPS (Emergency Medicine)'], experienceYears: 10, consultationFee: 500 },
];
```

### 15.3 Medicines (100) — Common Bangladeshi Brands

```typescript
const medicines = [
  { name: 'Napa', genericName: 'Paracetamol', brandName: 'Square', category: 'TABLET', strength: '500mg', unit: 'tablet', unitPrice: 0.50, sellingPrice: 1.50, stockQuantity: 5000 },
  { name: 'Seclo', genericName: 'Omeprazole', brandName: 'Square', category: 'CAPSULE', strength: '20mg', unit: 'capsule', unitPrice: 2.00, sellingPrice: 5.00, stockQuantity: 3000 },
  { name: 'Monas', genericName: 'Montelukast', brandName: 'Square', category: 'TABLET', strength: '10mg', unit: 'tablet', unitPrice: 3.00, sellingPrice: 8.00, stockQuantity: 2000 },
  { name: 'Amloc', genericName: 'Amlodipine', brandName: 'Square', category: 'TABLET', strength: '5mg', unit: 'tablet', unitPrice: 1.50, sellingPrice: 4.00, stockQuantity: 4000 },
  { name: 'Metformin', genericName: 'Metformin HCl', brandName: 'Incepta', category: 'TABLET', strength: '500mg', unit: 'tablet', unitPrice: 1.00, sellingPrice: 3.00, stockQuantity: 6000 },
  { name: 'NovoRapid', genericName: 'Insulin Aspart', brandName: 'Novo Nordisk', category: 'INJECTION', strength: '100U/ml', unit: 'vial', unitPrice: 450.00, sellingPrice: 650.00, stockQuantity: 200 },
  { name: 'Cef-3', genericName: 'Cefixime', brandName: 'Square', category: 'CAPSULE', strength: '200mg', unit: 'capsule', unitPrice: 5.00, sellingPrice: 12.00, stockQuantity: 2500 },
  { name: 'Azithrocin', genericName: 'Azithromycin', brandName: 'Square', category: 'TABLET', strength: '500mg', unit: 'tablet', unitPrice: 8.00, sellingPrice: 18.00, stockQuantity: 3000 },
  { name: 'Doxicap', genericName: 'Doxycycline', brandName: 'Incepta', category: 'CAPSULE', strength: '100mg', unit: 'capsule', unitPrice: 3.00, sellingPrice: 7.00, stockQuantity: 2000 },
  { name: 'Losectil', genericName: 'Esomeprazole', brandName: 'Incepta', category: 'CAPSULE', strength: '40mg', unit: 'capsule', unitPrice: 4.00, sellingPrice: 10.00, stockQuantity: 2500 },
  // ... 90 more medicines
];
```

### 15.4 Lab Test Types (30)

```typescript
const labTestTypes = [
  { name: 'Complete Blood Count (CBC)', nameBn: 'সম্পূর্ণ রক্ত পরীক্ষা', category: 'Hematology', price: 350, turnaroundTime: '2 hours', normalRange: { hemoglobin: { min: '12.0', max: '16.0', unit: 'g/dL' }, wbc: { min: '4000', max: '11000', unit: '/cmm' }, platelets: { min: '150000', max: '450000', unit: '/cmm' } } },
  { name: 'Random Blood Sugar (RBS)', nameBn: 'যেকোনো সময় রক্তে শর্করা', category: 'Biochemistry', price: 150, turnaroundTime: '1 hour', normalRange: { glucose: { min: '70', max: '140', unit: 'mg/dL' } } },
  { name: 'Fasting Blood Sugar (FBS)', nameBn: 'খালি পেটে রক্তে শর্করা', category: 'Biochemistry', price: 150, turnaroundTime: '1 hour', normalRange: { glucose: { min: '70', max: '100', unit: 'mg/dL' } } },
  { name: 'HbA1c', nameBn: 'এইচবিএ১সি', category: 'Biochemistry', price: 800, turnaroundTime: '4 hours', normalRange: { hba1c: { min: '4.0', max: '5.6', unit: '%' } } },
  { name: 'Lipid Profile', nameBn: 'লিপিড প্রোফাইল', category: 'Biochemistry', price: 900, turnaroundTime: '4 hours', normalRange: { totalCholesterol: { min: '0', max: '200', unit: 'mg/dL' }, ldl: { min: '0', max: '100', unit: 'mg/dL' }, hdl: { min: '40', max: '200', unit: 'mg/dL' }, triglycerides: { min: '0', max: '150', unit: 'mg/dL' } } },
  { name: 'Liver Function Test (LFT)', nameBn: 'লিভার ফাংশন টেস্ট', category: 'Biochemistry', price: 1200, turnaroundTime: '4 hours', normalRange: { sgpt: { min: '0', max: '40', unit: 'U/L' }, sgot: { min: '0', max: '40', unit: 'U/L' }, bilirubin: { min: '0.1', max: '1.2', unit: 'mg/dL' } } },
  { name: 'Thyroid Function Test (TFT)', nameBn: 'থাইরয়েড ফাংশন টেস্ট', category: 'Biochemistry', price: 1500, turnaroundTime: '24 hours', normalRange: { t3: { min: '80', max: '200', unit: 'ng/dL' }, t4: { min: '5.0', max: '12.0', unit: 'ug/dL' }, tsh: { min: '0.4', max: '4.0', unit: 'mIU/L' } } },
  { name: 'Serum Creatinine', nameBn: 'সেরাম ক্রিয়েটিনিন', category: 'Biochemistry', price: 300, turnaroundTime: '2 hours', normalRange: { creatinine: { min: '0.6', max: '1.2', unit: 'mg/dL' } } },
  { name: 'Urine R/E', nameBn: 'প্রস্রাব পরীক্ষা', category: 'Microbiology', price: 200, turnaroundTime: '2 hours', normalRange: { ph: { min: '4.5', max: '8.0', unit: '' }, specificGravity: { min: '1.005', max: '1.030', unit: '' } } },
  { name: 'X-Ray Chest PA View', nameBn: 'বুকের এক্স-রে', category: 'Radiology', price: 500, turnaroundTime: '1 hour' },
  { name: 'USG Whole Abdomen', nameBn: 'পেটের আল্ট্রাসাউন্ড', category: 'Radiology', price: 1500, turnaroundTime: '2 hours' },
  { name: 'ECG', nameBn: 'ইসিজি', category: 'Cardiology', price: 300, turnaroundTime: '30 minutes' },
  { name: 'Echo Cardiography', nameBn: 'একো কার্ডিওগ্রাফি', category: 'Cardiology', price: 2500, turnaroundTime: '1 hour' },
  { name: 'CT Scan Brain', nameBn: 'ব্রেইন সিটি স্ক্যান', category: 'Radiology', price: 8000, turnaroundTime: '4 hours' },
  { name: 'MRI Brain', nameBn: 'ব্রেইন এমআরআই', category: 'Radiology', price: 12000, turnaroundTime: '24 hours' },
  // ... 15 more test types
];
```

### 15.5 Patients (50) — Realistic Bangladeshi Data

```typescript
const patients = [
  { fullName: 'Mohammad Ali', fullNameBn: 'মোহাম্মদ আলী', phone: '01712345678', dateOfBirth: '1980-05-15', gender: 'MALE', bloodGroup: 'B+', address: 'House 12, Road 5, Dhanmondi, Dhaka' },
  { fullName: 'Sajeda Khatun', fullNameBn: 'সাজেদা খাতুন', phone: '01812345679', dateOfBirth: '1975-08-22', gender: 'FEMALE', bloodGroup: 'O+', address: 'House 45, Block C, Mirpur 10, Dhaka' },
  { fullName: 'Rahim Uddin', fullNameBn: 'রহিম উদ্দিন', phone: '01912345680', dateOfBirth: '1990-03-10', gender: 'MALE', bloodGroup: 'A+', address: 'Flat 3B, Gulshan Avenue, Dhaka' },
  { fullName: 'Fatema Begum', fullNameBn: 'ফাতেমা বেগম', phone: '01612345681', dateOfBirth: '1985-11-30', gender: 'FEMALE', bloodGroup: 'AB+', address: 'House 78, Sector 7, Uttara, Dhaka' },
  { fullName: 'Abdul Karim', fullNameBn: 'আবদুল করিম', phone: '01512345682', dateOfBirth: '1965-01-20', gender: 'MALE', bloodGroup: 'O-', address: 'House 23, Road 7, Mohammadpur, Dhaka' },
  // ... 45 more patients with realistic Bengali names and Dhaka addresses
];
```

---

## 16. Acceptance Criteria (Definition of Done)

A feature is considered **complete** when ALL of the following are true:

- [ ] **Backend:** NestJS module, controller, service, DTOs with class-validator implemented
- [ ] **Backend:** RBAC guards protect all routes appropriately
- [ ] **Backend:** Swagger documentation auto-generated and accurate
- [ ] **Backend:** Unit tests for service methods (Jest)
- [ ] **Frontend:** Next.js page(s) implemented with App Router
- [ ] **Frontend:** Responsive design (desktop + tablet + mobile for patient portal)
- [ ] **Frontend:** Form validation with Zod schemas (shared with backend)
- [ ] **Frontend:** Error handling with user-friendly toast messages (sonner)
- [ ] **Frontend:** Loading states (skeletons, spinners) for all async operations
- [ ] **Frontend:** Empty states for empty lists
- [ ] **Frontend:** TanStack Query for server state (caching, refetching, optimistic updates)
- [ ] **Frontend:** Bengali language support (next-intl)
- [ ] **Database:** TypeORM migration created and tested
- [ ] **Demo Data:** Seed data available for testing
- [ ] **PDF:** PDF generation works (if applicable)
- [ ] **Audit:** Audit log created for data mutations
- [ ] **Real-time:** Socket.io events emitted and handled (if applicable)
- [ ] **Accessibility:** Keyboard navigation, ARIA labels, color contrast
- [ ] **Performance:** React.memo, useMemo, useCallback where needed
- [ ] **Code:** Committed with clear conventional commit message

---

## 17. Future Enhancements (Post-MVP)

- [ ] **Telemedicine:** Video consultation integration (WebRTC)
- [ ] **Insurance Integration:** Direct claim submission to insurance providers
- [ ] **SMS Gateway:** Real Bangladeshi SMS provider (SSL Wireless, Banglalink, Grameenphone)
- [ ] **Barcode/QR:** Patient wristbands, medicine barcode scanning
- [ ] **Multi-branch:** Support for hospital chains (Square-style satellite centers)
- [ ] **Mobile App:** React Native app for patient portal + staff
- [ ] **AI Features:** Symptom checker, drug interaction warnings
- [ ] **HL7/FHIR Compliance:** Standard health data exchange format
- [ ] **Biometric Integration:** Fingerprint login for staff
- [ ] **Automated Reports:** Scheduled email reports to management
- [ ] **Inventory Forecasting:** ML-based medicine demand prediction
- [ ] **Patient Feedback:** Post-visit survey system
- [ ] **Online Pharmacy:** E-commerce for medicine delivery
- [ ] **Health Blog:** CMS for health articles and tips

---

**Document Version:** 2.0
**Last Updated:** 2026-07-21
**Stack:** Next.js 15 + NestJS + PostgreSQL + Redis
**Author:** AI Technical Specification for CV Project

---

*This specification is designed to be consumed by AI coding agents. Each section contains actionable implementation details. Start with Phase 1 and proceed sequentially. The document covers everything from database schema to pixel-perfect UI specifications.*
