'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppointments } from '@/hooks/useAppointments';
import { Plus, Calendar, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  checked_in: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  no_show: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data, isLoading } = useAppointments({ date });

  const apts = (data as any)?.data || [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
        <button onClick={() => router.push('/appointments/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} className="w-48 h-10 px-3 rounded-md border border-border bg-white text-sm" />
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Token</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Doctor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Type</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : apts.length === 0 ? (
              <tr><td colSpan={6}><EmptyState icon={<Calendar className="w-8 h-8 text-text-muted" />} title="No appointments for this date" description="Select a different date or book a new appointment." /></td></tr>
            ) : apts.map((apt: any) => (
              <tr key={apt.id} onClick={() => router.push(`/appointments/${apt.id}`)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                <td className="px-4 py-3 text-sm font-mono text-text-muted">{apt.appointmentNo}</td>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{apt.patient?.fullName || '-'}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{apt.doctor?.fullName || '-'}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{apt.timeSlot}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColors[apt.status] || '')}>{apt.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted capitalize">{apt.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
