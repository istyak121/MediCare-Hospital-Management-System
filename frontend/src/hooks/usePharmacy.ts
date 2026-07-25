'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  category: string;
  strength?: string;
  unit?: string;
  unitPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineListResponse {
  data: Medicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useMedicines(params: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category', params.category);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  return useQuery<MedicineListResponse>({
    queryKey: ['medicines', params],
    queryFn: () => apiFetch(`/pharmacy/medicines?${qs.toString()}`),
  });
}

export function useMedicine(id: string) {
  return useQuery<Medicine>({
    queryKey: ['medicine', id],
    queryFn: () => apiFetch(`/pharmacy/medicines/${id}`),
    enabled: !!id,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch('/pharmacy/medicines', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
}

export function useUpdateMedicine(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/pharmacy/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['medicine', id] });
    },
  });
}

export function useAdjustStock(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { quantity: number; reason?: string }) =>
      apiFetch(`/pharmacy/medicines/${id}/adjust-stock`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['medicine', id] });
    },
  });
}

export function useLowStock() {
  return useQuery<Medicine[]>({
    queryKey: ['medicines', 'low-stock'],
    queryFn: () => apiFetch('/pharmacy/medicines/low-stock'),
  });
}

export function useDispense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch('/pharmacy/dispense', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
}
