'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function PortalPrescriptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'prescriptions'],
    queryFn: () => apiFetch('/prescriptions'),
  });
  const rxList = Array.isArray(data) ? data : (data as any)?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">My Prescriptions</h1>
      {isLoading ? <p className="text-text-muted">Loading...</p> : rxList.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rxList.map((rx: any) => (
            <div key={rx.id} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{rx.prescriptionNo}</p>
                <span className="text-xs text-text-muted">{formatDate(rx.createdAt)}</span>
              </div>
              <p className="text-sm text-text-primary mt-1">{rx.diagnosis}</p>
              <p className="text-xs text-text-muted mt-1">Dr. {rx.doctor?.fullName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
