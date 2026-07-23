'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Department {
  id: string;
  name: string;
  nameBn?: string;
  icon?: string;
  description?: string;
}

export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => apiFetch('/departments'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentDoctors(deptId?: string) {
  return useQuery<any[]>({
    queryKey: ['departments', deptId, 'doctors'],
    queryFn: () => apiFetch(`/departments/${deptId}/doctors`),
    enabled: !!deptId,
  });
}
