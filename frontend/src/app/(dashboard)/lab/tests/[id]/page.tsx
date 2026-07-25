'use client';

import React from 'react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLabTest, useCollectSample, useStartTest, useCompleteTest } from '@/hooks/useLabTests';
import { ChevronLeft, AlertTriangle, Clock, CheckCircle, Save, Loader2, FileText, Plus, ChevronRight, ChevronLeft as ChevronLeftIcon, FlaskConical } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

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

const statusOrder = ['requested', 'sample_collected', 'in_progress', 'completed'];

export default function LabTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: test, isLoading } = useLabTest(id);
  const collectSample = useCollectSample(id);
  const startTest = useStartTest(id);
  const completeTest = useCompleteTest(id);
  const [results, setResults] = useState('');
  const [resultNotes, setResultNotes] = useState('');

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-md" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    </div>
  );
  if (!test) return <div className="text-center py-12 text-text-muted">Lab test not found</div>;

  const currentStatusIndex = statusOrder.indexOf(test.status);

  const handleCollect = async () => {
    try {
      await collectSample.mutateAsync({});
      toast.success('Sample collected');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to collect sample');
    }
  };

  const handleStart = async () => {
    try {
      await startTest.mutateAsync();
      toast.success('Test started');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start test');
    }
  };

  const handleComplete = async () => {
    if (!results.trim()) return toast.error('Enter test results');
    try {
      await completeTest.mutateAsync({ results, resultNotes });
      toast.success('Test completed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete test');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/lab/tests')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FlaskConical className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{test.testNo}</h1>
            <p className="text-sm text-text-muted">{test.testType?.name} | {statusLabels[test.status as keyof typeof statusLabels] || test.status}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Patient</p>
          <p className="text-sm font-medium">{test.patient?.fullName || '-'}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Test Type</p>
          <p className="text-sm font-medium">{test.testType?.name || '-'}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Status</p>
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border {statusColors[test.status] || 'bg-bg-tertiary text-text-muted border-border'}">
            {statusLabels[test.status as keyof typeof statusLabels] || test.status}
          </span>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Requested</p>
          <p className="text-sm font-medium">{formatDate(test.createdAt)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Status Workflow</h3>
        <div className="flex items-center">
          {statusOrder.map((status, i) => (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
                  i < currentStatusIndex
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                    : i === currentStatusIndex
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-bg-tertiary border-border text-text-muted'
                )}>
                  {i < currentStatusIndex ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <p className="text-xs text-center mt-1 text-text-muted max-w-[80px]">
                  {statusLabels[status as keyof typeof statusLabels]}
                </p>
              </div>
              {i < statusOrder.length - 1 && <div className="flex-1 h-1 mx-2" style={{ backgroundColor: i < currentStatusIndex ? '#10b981' : '#e5e7eb' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Test Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-text-muted">Test #</label><p className="text-sm font-mono text-text-muted">{test.testNo}</p></div>
            <div><label className="text-xs text-text-muted">Category</label><p className="text-sm font-medium">{test.testType?.category || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Patient ID</label><p className="text-sm font-medium">{test.patient?.patientId || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Requested By</label><p className="text-sm font-medium">{test.requestedById}</p></div>
            <div className="col-span-2"><label className="text-xs text-text-muted">Sample Collected</label><p className="text-sm font-medium">{test.sampleCollectedAt ? formatDate(test.sampleCollectedAt) : 'Not collected'}</p></div>
            <div className="col-span-2"><label className="text-xs text-text-muted">Completed</label><p className="text-sm font-medium">{test.completedAt ? formatDate(test.completedAt) : 'Not completed'}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {test.status === 'completed' ? 'Test Results' : 'Complete Test'}
          </h3>
          {test.status === 'completed' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted">Results</label>
                <div className="mt-1 p-4 bg-bg-secondary rounded-md border border-border min-h-[100px] whitespace-pre-wrap text-sm">{test.results || 'No results recorded'}</div>
              </div>
              <div>
                <label className="text-xs text-text-muted">Result Notes</label>
                <div className="mt-1 p-4 bg-bg-secondary rounded-md border border-border min-h-[60px] text-sm text-text-muted">{test.resultNotes || 'No notes'}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {test.status === 'in_progress' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Results *</label>
                  <textarea
                    value={results}
                    onChange={e => setResults(e.target.value)}
                    rows={6}
                    placeholder="Enter test results, values, observations..."
                    className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              {test.status === 'in_progress' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Result Notes</label>
                  <textarea
                    value={resultNotes}
                    onChange={e => setResultNotes(e.target.value)}
                    rows={2}
                    placeholder="Additional notes, interpretation, recommendations..."
                    className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-border">
                {test.status === 'requested' && (
                  <button onClick={handleCollect} disabled={collectSample.isPending} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
                    {collectSample.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <AlertTriangle className="w-4 h-4" /> Collect Sample
                  </button>
                )}
                {test.status === 'sample_collected' && (
                  <button onClick={handleStart} disabled={startTest.isPending} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                    {startTest.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Clock className="w-4 h-4" /> Start Test
                  </button>
                )}
                {test.status === 'in_progress' && (
                  <button onClick={handleComplete} disabled={completeTest.isPending} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                    {completeTest.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <CheckCircle className="w-4 h-4" /> Complete Test
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}