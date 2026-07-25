'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useInvoices(params: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.type) qs.set('type', params.type);
  if (params.page) qs.set('page', String(params.page));

  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => apiFetch(`/billing/invoices?${qs.toString()}`),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => apiFetch(`/billing/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/billing/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
}

export function useDailyCollection(date?: string) {
  const qs = new URLSearchParams();
  if (date) qs.set('date', date);
  return useQuery({
    queryKey: ['billing', 'daily-collection', date],
    queryFn: () => apiFetch(`/billing/daily-collection?${qs.toString()}`),
  });
}

export function useOutstandingBills() {
  return useQuery({
    queryKey: ['billing', 'outstanding'],
    queryFn: () => apiFetch('/billing/outstanding'),
  });
}
