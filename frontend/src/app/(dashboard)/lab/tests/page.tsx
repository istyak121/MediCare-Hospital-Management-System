'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLabTests } from '@/hooks/useLabTests';
import { Plus, Search, ChevronLeft, ChevronRight, Filter, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const statusTabs = ['all', 'requested', 'sample_collected', 'in_progress', 'completed', 'cancelled'];

const statusColors = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  sample_collected: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
  requested: 'Requested',
  sample_collected: 'Sample Collected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function LabTestsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLabTests({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    page,
    limit: 25,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Lab Tests</h1>
        <button onClick={() => router.push('/lab/tests/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> New Test Request
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by test #, patient, test type..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-1 bg-bg-secondary p-1 rounded-md">
          {statusTabs.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={cn('px-3 py-1.5 text-sm font-medium rounded transition-colors', s === status ? 'bg-primary-100 text-primary-700' : 'text-text-muted hover:text-text-primary')}
            >
              {s === 'all' ? 'All' : statusLabels[s as keyof typeof statusLabels]}
            </button>
          ))}
        </div>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Test #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Test Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
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
                  <td colSpan={6}>
                    <EmptyState
                      icon={<AlertTriangle className="w-8 h-8 text-text-muted" />}
                      title="No lab tests found"
                      description="Try adjusting your search or create a new test request."
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((test: any) => (
                  <tr key={test.id} onClick={() => router.push('/lab/tests/' + test.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{test.testNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{test.patient?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{test.testType?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border {statusColors[test.status] || 'bg-bg-tertiary text-text-muted border-border'}">
                        {statusLabels[test.status as keyof typeof statusLabels] || test.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatDate(test.createdAt)}</td>
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