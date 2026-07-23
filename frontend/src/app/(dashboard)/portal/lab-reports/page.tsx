'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FlaskConical } from 'lucide-react';

export default function PortalLabReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'lab-tests'],
    queryFn: () => apiFetch('/lab-tests'),
  });
  const tests = Array.isArray(data) ? data : (data as any)?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">Lab Reports</h1>
      {isLoading ? <p className="text-text-muted">Loading...</p> : tests.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <FlaskConical className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No lab tests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test: any) => (
            <div key={test.id} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{test.testType?.name || test.testNo}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${test.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{test.status}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">{test.testNo} | {formatDate(test.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
