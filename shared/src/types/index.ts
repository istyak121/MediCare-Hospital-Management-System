// Shared TypeScript types — mirror entities for clean client-side usage
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

export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  preferredLanguage: string;
  lastLoginAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: string };
}
