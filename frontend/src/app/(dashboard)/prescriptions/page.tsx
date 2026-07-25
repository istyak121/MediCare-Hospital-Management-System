'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { FileText, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PrescriptionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePrescriptions({ search: search || undefined, page, limit: 25 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Prescriptions</h1>
        <button onClick={() => router.push('/prescriptions/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> New Prescription
        </button>
      </div>

      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by prescription #, patient, or doctor..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Rx #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Diagnosis</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No prescriptions found</p>
                  </td>
                </tr>
              ) : (
                data.data.map((rx: any) => (
                  <tr key={rx.id} onClick={() => router.push('/prescriptions/' + rx.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{rx.prescriptionNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{rx.patient?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{rx.doctor?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-muted max-w-[200px] truncate">{rx.diagnosis}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatDate(rx.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-secondary">
            <span className="text-sm text-text-muted">
              Showing {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium px-2">{data.page} / {data.totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= data.totalPages} className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
