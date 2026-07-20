export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'receptionist'
  | 'doctor'
  | 'nurse'
  | 'lab_technician'
  | 'pharmacist'
  | 'accountant'
  | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  preferredLanguage: string;
  staffId?: string;
  patientId?: string;
  staff?: any;
  patient?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user: { id: string; email: string; role: UserRole };
}
