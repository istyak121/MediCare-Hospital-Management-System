'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface PatientStatsResponse {
  totalPatients: number;
  todayAppointments: number;
  activeAdmissions: number;
}

export interface RevenueResponse {
  days: number;
  total: number;
  count: number;
  byDate: Record<string, number>;
}

export interface BedOccupancyResponse {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  occupancyRate: number;
}

export interface TopDiagnosis {
  diagnosis: string;
  count: number;
}

export function usePatientStats() {
  return useQuery<PatientStatsResponse>({
    queryKey: ['reports', 'patient-stats'],
    queryFn: () => apiFetch('/reports/patient-stats'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenue(days: number = 30) {
  return useQuery<RevenueResponse>({
    queryKey: ['reports', 'revenue', days],
    queryFn: () => apiFetch(`/reports/revenue?days=${days}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBedOccupancy() {
  return useQuery<BedOccupancyResponse>({
    queryKey: ['reports', 'bed-occupancy'],
    queryFn: () => apiFetch('/reports/bed-occupancy'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopDiagnoses() {
  return useQuery<TopDiagnosis[]>({
    queryKey: ['reports', 'top-diagnoses'],
    queryFn: () => apiFetch('/reports/top-diagnoses'),
    staleTime: 5 * 60 * 1000,
  });
}
