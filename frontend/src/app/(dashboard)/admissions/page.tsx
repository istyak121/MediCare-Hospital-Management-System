'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissions } from '@/hooks/useAdmissions';
import { BedDouble, Plus, Search, ChevronLeft, ChevronRight, Filter, Home, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  discharged: 'bg-blue-50 text-blue-700 border-blue-200',
  transferred: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusLabels = {
  active: 'Active',
  discharged: 'Discharged',
  transferred: 'Transferred',
};

export default function AdmissionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdmissions({ search: search || undefined, status: status || undefined, page, limit: 25 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Admissions / IPD</h1>
        <button onClick={() => router.push('/admissions/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> New Admission
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by admission #, patient name, doctor..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
          <option value="transferred">Transferred</option>
        </select>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Admission #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Bed / Ward</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Admitted</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<UserCheck className="w-8 h-8 text-text-muted" />}
                      title="No admissions found"
                      description="Try adjusting your search or create a new admission."
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((adm: any) => (
                  <tr key={adm.id} onClick={() => router.push('/admissions/' + adm.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{adm.admissionNo}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">{adm.patient?.fullName || '-'}</div>
                      <div className="text-xs text-text-muted">{adm.patient?.patientId || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{adm.doctor?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {adm.bed?.bedNumber || '-'} / {adm.bed?.ward?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatDate(adm.admissionDate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border {statusColors[adm.status] || 'bg-bg-tertiary text-text-muted border-border'}">
                        {statusLabels[adm.status as keyof typeof statusLabels] || adm.status}
                      </span>
                    </td>
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
