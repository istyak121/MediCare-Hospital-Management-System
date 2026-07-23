'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useAppointments(params: {
  date?: string;
  doctorId?: string;
  status?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params.date) qs.set('date', params.date);
  if (params.doctorId) qs.set('doctorId', params.doctorId);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));

  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => apiFetch(`/appointments?${qs.toString()}`),
  });
}

export function useTodayQueue() {
  return useQuery({
    queryKey: ['appointments', 'today-queue'],
    queryFn: () => apiFetch('/appointments/today-queue'),
    refetchInterval: 15000,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiFetch(`/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); },
  });
}

export function useDoctorSchedule(doctorId: string) {
  return useQuery({
    queryKey: ['schedules', doctorId],
    queryFn: () => apiFetch(`/schedules/doctor/${doctorId}`),
    enabled: !!doctorId,
  });
}

export function useAvailableSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['schedules', 'available', doctorId, date],
    queryFn: () => apiFetch(`/schedules/available?doctorId=${doctorId}&date=${date}`),
    enabled: !!doctorId && !!date,
  });
}
