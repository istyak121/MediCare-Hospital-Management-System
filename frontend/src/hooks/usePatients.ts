'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Patient {
  id: string;
  patientId: string;
  fullName: string;
  fullNameBn?: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  createdAt: string;
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePatients(params: {
  search?: string;
  page?: number;
  limit?: number;
  gender?: string;
  dateRange?: string;
}) {
  const queryString = new URLSearchParams();
  if (params.search) queryString.set('search', params.search);
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.gender) queryString.set('gender', params.gender);
  if (params.dateRange) queryString.set('dateRange', params.dateRange);

  return useQuery<PatientListResponse>({
    queryKey: ['patients', params],
    queryFn: () => apiFetch(`/patients?${queryString.toString()}`),
  });
}

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => apiFetch(`/patients/${id}`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });
}

export function usePatientHistory(id: string) {
  return useQuery({
    queryKey: ['patient', id, 'history'],
    queryFn: () => apiFetch(`/patients/${id}/history`),
    enabled: !!id,
  });
}

export function usePatientRelations(id: string, relation: string) {
  return useQuery<any[]>({
    queryKey: ['patient', id, relation],
    queryFn: () => apiFetch(`/patients/${id}/${relation}`),
    enabled: !!id,
  });
}
