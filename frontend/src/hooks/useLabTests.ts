'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface TestType {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

export interface LabTest {
  id: string;
  testNo: string;
  patientId: string;
  patient?: {
    id: string;
    fullName: string;
    patientId?: string;
  };
  testTypeId: string;
  testType?: TestType;
  status: 'requested' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  requestedById: string;
  results?: string;
  resultNotes?: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface LabTestListResponse {
  data: LabTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useLabTests(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  return useQuery<LabTestListResponse>({
    queryKey: ['labTests', params],
    queryFn: () => apiFetch(`/lab-tests?${qs.toString()}`),
  });
}

export function useLabTest(id: string) {
  return useQuery<LabTest>({
    queryKey: ['labTest', id],
    queryFn: () => apiFetch(`/lab-tests/${id}`),
    enabled: !!id,
  });
}

export function useTestTypes() {
  return useQuery<TestType[]>({
    queryKey: ['labTestTypes'],
    queryFn: () => apiFetch('/lab-tests/test-types'),
  });
}

export function useRequestLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch('/lab-tests', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labTests'] });
    },
  });
}

export function useCollectSample(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { collectedBy?: string }) => apiFetch(`/lab-tests/${id}/collect`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labTests'] });
      qc.invalidateQueries({ queryKey: ['labTest', id] });
    },
  });
}

export function useStartTest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/lab-tests/${id}/start`, { method: 'PUT' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labTests'] });
      qc.invalidateQueries({ queryKey: ['labTest', id] });
    },
  });
}

export function useCompleteTest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { results: string; resultNotes?: string }) => apiFetch(`/lab-tests/${id}/complete`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labTests'] });
      qc.invalidateQueries({ queryKey: ['labTest', id] });
    },
  });
}