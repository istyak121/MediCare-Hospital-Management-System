'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface PrescriptionMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  patientId: string;
  patient?: { id: string; fullName: string; patientId?: string; };
  doctorId: string;
  doctor?: { id: string; fullName: string; };
  diagnosis: string;
  chiefComplaint?: string;
  advice?: string;
  followUpDate?: string;
  medicines: PrescriptionMedicine[];
  createdAt: string;
}

export interface PrescriptionListResponse {
  data: Prescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MedicineSearchResult {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  unit?: string;
  sellingPrice?: number;
}

export function usePrescriptions(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  return useQuery<PrescriptionListResponse>({
    queryKey: ['prescriptions', params],
    queryFn: () => apiFetch('/prescriptions?' + qs.toString()),
  });
}

export function usePrescription(id: string) {
  return useQuery<Prescription>({
    queryKey: ['prescription', id],
    queryFn: () => apiFetch('/prescriptions/' + id),
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); },
  });
}

export function useSearchMedicines(query: string) {
  return useQuery<MedicineSearchResult[]>({
    queryKey: ['prescriptions', 'search-medicines', query],
    queryFn: () => apiFetch('/prescriptions/search-medicines?q=' + encodeURIComponent(query)),
    enabled: query.length >= 2,
    staleTime: 5000,
  });
}