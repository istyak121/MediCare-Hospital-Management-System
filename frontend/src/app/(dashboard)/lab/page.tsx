'use client';

import { useRouter } from 'next/navigation';
import { useLabTests, useTestTypes } from '@/hooks/useLabTests';
import { FlaskConical, AlertTriangle, Clock, CheckCircle, Plus, ArrowRight, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const statusColors: Record<string, string> = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  sample_collected: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<string, string> = {
  requested: 'Requested',
  sample_collected: 'Sample Collected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function LabPage() {
  const router = useRouter();
  const { data: allTests, isLoading: loadingAll } = useLabTests({ limit: 1 });
  const { data: testTypes, isLoading: loadingTypes } = useTestTypes();

  const pendingCount = allTests?.data?.filter((t: any) => t.status === 'requested').length || 0;
  const collectedCount = allTests?.data?.filter((t: any) => t.status === 'sample_collected').length || 0;
  const inProgressCount = allTests?.data?.filter((t: any) => t.status === 'in_progress').length || 0;
  const completedToday = allTests?.data?.filter((t: any) => t.status === 'completed' && t.completedAt?.startsWith(new Date().toISOString().split('T')[0])).length || 0;
  const totalTests = allTests?.total || 0;
  const testTypesCount = testTypes?.length || 0;

  const { data: recentTests, isLoading: loadingRecent } = useLabTests({ limit: 5 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Laboratory</h1>
            <p className="text-sm text-text-muted">Lab test requests, sample collection, and result reporting</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/lab/tests/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
            <Plus className="w-4 h-4" /> New Test Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{loadingAll ? '...' : pendingCount}</p>
              <p className="text-sm text-text-muted">Pending Collection</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{loadingAll ? '...' : collectedCount}</p>
              <p className="text-sm text-text-muted">Sample Collected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{loadingAll ? '...' : inProgressCount}</p>
              <p className="text-sm text-text-muted">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{loadingAll ? '...' : completedToday}</p>
              <p className="text-sm text-text-muted">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{loadingAll ? '...' : totalTests}</p>
              <p className="text-sm text-text-muted">Total Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Recent Test Requests</h3>
          <button onClick={() => router.push('/lab/tests')} className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {loadingRecent ? (
          <div className="space-y-3">
            {[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : !recentTests?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <FlaskConical className="w-10 h-10 mb-2" />
            <p className="text-sm">No test requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Test #</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Patient</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Test Type</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Status</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Date</th>
                  <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.data.slice(0, 5).map((test: any) => (
                  <tr key={test.id} onClick={() => router.push('/lab/tests/' + test.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-2.5 text-sm font-mono text-text-muted">{test.testNo}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-text-primary">{test.patient?.fullName || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{test.testType?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border {statusColors[test.status] || 'bg-bg-tertiary text-text-muted border-border'}">
                        {statusLabels[test.status] || test.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{formatDate(test.createdAt)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => router.push('/lab/tests/new')} className="bg-white rounded-xl border border-border shadow-sm p-5 text-left">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3"><Plus className="w-5 h-5 text-primary-600" /></div>
          <h4 className="font-semibold text-text-primary mb-1">New Test Request</h4>
          <p className="text-sm text-text-muted">Create a lab test request for a patient</p>
        </button>
        <button onClick={() => router.push('/lab/tests')} className="bg-white rounded-xl border border-border shadow-sm p-5 text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3"><Search className="w-5 h-5 text-blue-600" /></div>
          <h4 className="font-semibold text-text-primary mb-1">All Test Requests</h4>
          <p className="text-sm text-text-muted">View, filter, and manage all lab tests</p>
        </button>
        <button onClick={() => router.push('/lab/tests')} className="bg-white rounded-xl border border-border shadow-sm p-5 text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3"><FlaskConical className="w-5 h-5 text-purple-600" /></div>
          <h4 className="font-semibold text-text-primary mb-1">Test Types</h4>
          <p className="text-sm text-text-muted">{testTypesCount} test types available</p>
        </button>
      </div>
    </div>
  );
}
