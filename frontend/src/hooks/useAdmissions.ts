'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Admission {
  id: string;
  admissionNo: string;
  patientId: string;
  patient?: { id: string; fullName: string; patientId?: string; };
  doctorId: string;
  doctor?: { id: string; fullName: string; };
  bedId: string;
  bed?: { id: string; bedNumber: string; ward?: { id: string; name: string; }; };
  admissionDate: string;
  dischargeDate?: string;
  admissionType: 'planned' | 'emergency';
  status: 'active' | 'discharged' | 'transferred';
  diagnosis?: string;
  symptoms?: string[];
  progressNotes?: { id: string; note: string; authorName?: string; createdAt: string; }[];
  createdAt: string;
}

export function useAdmissions(params: { search?: string; status?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return useQuery<{ data: Admission[]; total: number; page: number; limit: number; totalPages: number; }>({
    queryKey: ['admissions', params],
    queryFn: () => apiFetch('/admissions?' + qs.toString()),
  });
}

export function useAdmission(id: string) {
  return useQuery<Admission>({
    queryKey: ['admission', id],
    queryFn: () => apiFetch('/admissions/' + id),
    enabled: !!id,
  });
}

export function useWards() {
  return useQuery<{ id: string; name: string; }[]>({
    queryKey: ['wards'],
    queryFn: () => apiFetch('/admissions/wards'),
  });
}

export function useBedAvailability(wardId?: string) {
  return useQuery<{ id: string; bedNumber: string; ward?: { name: string }; isOccupied: boolean; }[]>({
    queryKey: ['bed-availability', wardId],
    queryFn: () => apiFetch('/admissions/bed-availability' + (wardId ? '?wardId=' + wardId : '')),
  });
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => apiFetch('/patients?limit=1000'),
  });
}

export function useAdmitPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch('/admissions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['bed-availability'] }); },
  });
}

export function useDischarge(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { dischargeNotes?: string }) => apiFetch('/admissions/' + id + '/discharge', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['admission', id] }); qc.invalidateQueries({ queryKey: ['bed-availability'] }); },
  });
}

export function useTransferBed(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { newBedId: string }) => apiFetch('/admissions/' + id + '/transfer', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['admission', id] }); qc.invalidateQueries({ queryKey: ['bed-availability'] }); },
  });
}

export function useAddProgressNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { note: string }) => apiFetch('/admissions/' + id + '/progress-notes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admission', id] }); },
  });
}