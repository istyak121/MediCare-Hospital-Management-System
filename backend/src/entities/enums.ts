// ============================================================
// Shared enums used across TypeORM entities (spec §3.2 / §4.1)
// ============================================================

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

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum WardType {
  GENERAL = 'general',
  CABIN = 'cabin',
  ICU = 'icu',
  NICU = 'nicu',
  CCU = 'ccu',
  EMERGENCY = 'emergency',
}

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

export enum LabTestStatus {
  REQUESTED = 'requested',
  SAMPLE_COLLECTED = 'sample_collected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

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

export enum ItemType {
  CONSULTATION = 'consultation',
  LAB_TEST = 'lab_test',
  MEDICINE = 'medicine',
  ROOM_RENT = 'room_rent',
  PROCEDURE = 'procedure',
  PACKAGE = 'package',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  ROCKET = 'rocket',
  BANK_TRANSFER = 'bank_transfer',
  INSURANCE = 'insurance',
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  LAB_RESULT = 'lab_result',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  EMERGENCY = 'emergency',
}
