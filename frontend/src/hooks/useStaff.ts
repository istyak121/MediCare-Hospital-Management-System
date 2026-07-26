'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface StaffMember {
  id: string;
  employeeId: string;
  fullName: string;
  fullNameBn?: string;
  phone: string;
  gender: string;
  email?: string;
  designation?: string;
  specialization?: string;
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  departmentId?: string;
  department?: { id: string; name: string; };
  user?: { 
    id: string; 
    email: string;
    fullName: string;
    fullNameBn?: string;
    phone: string;
    address?: string;
    gender: string;
    dateOfBirth?: string;
    isActive: boolean;
  };
  schedules?: { id: string; dayOfWeek: string; startTime: string; endTime: string; isAvailable: boolean; }[];
  createdAt: string;
}

export interface StaffListResponse {
  data: StaffMember[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function useStaff(params: { departmentId?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params.departmentId) qs.set('departmentId', params.departmentId);
  if (params.search) qs.set('search', params.search);
  return useQuery<StaffListResponse>({
    queryKey: ['staff', params],
    queryFn: () => apiFetch('/staff?' + qs.toString()),
  });
}

export function useDoctors(params: { departmentId?: string }) {
  const qs = new URLSearchParams();
  if (params.departmentId) qs.set('departmentId', params.departmentId);
  return useQuery<StaffMember[]>({
    queryKey: ['staff', 'doctors', params],
    queryFn: () => apiFetch('/staff/doctors?' + qs.toString()),
  });
}

export function useStaffMember(id: string) {
  return useQuery<StaffMember>({
    queryKey: ['staffMember', id],
    queryFn: () => apiFetch('/staff/' + id),
    enabled: !!id,
  });
}