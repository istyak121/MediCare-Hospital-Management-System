'use client';

import { useTodayQueue, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Phone, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'border-l-blue-500' },
  checked_in: { label: 'Checked In', color: 'border-l-amber-500 bg-amber-50/30' },
  in_progress: { label: 'In Progress', color: 'border-l-purple-500 bg-purple-50/30' },
  completed: { label: 'Completed', color: 'border-l-emerald-500 bg-emerald-50/30' },
  no_show: { label: 'No Show', color: 'border-l-slate-400 bg-slate-50/50' },
};

export default function QueuePage() {
  const { data, isLoading } = useTodayQueue();
  const updateStatus = useUpdateAppointmentStatus();

  const queue = data || ({} as any);
  const columns = ['scheduled', 'checked_in', 'in_progress', 'completed'];

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Marked as ${status.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <Skeleton className="h-12 rounded-none" />
          <div className="p-3 space-y-2">
            {[0, 1].map(j => <Skeleton key={j} className="h-24 w-full" />)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Queue Management</h1>
          <p className="text-sm text-text-muted">{queue.date} — {queue.total} appointments today</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => {
          const items = queue[col] || [];
          const cfg = statusConfig[col];
          return (
            <div key={col} className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
              <div className={cn('px-4 py-3 border-b border-border font-medium text-sm flex items-center justify-between', cfg.color.split(' ')[0] === 'border-l-blue-500' ? 'bg-blue-50/50' : '')}>
                <span>{cfg?.label || col}</span>
                <span className="w-6 h-6 rounded-full bg-bg-tertiary text-xs flex items-center justify-center font-medium">{items.length}</span>
              </div>
              <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {items.length === 0 && <EmptyState icon={<Clock className="w-6 h-6 text-text-muted" />} title="No patients" className="py-4" />}
                {items.map((card: any) => (
                  <div key={card.id} className={cn('bg-white rounded-md border border-border p-3 cursor-pointer hover:shadow-md transition-shadow', cfg?.color || '')}>
                    <p className="text-lg font-bold text-text-primary">{card.appointmentNo?.replace('APT-', '')}</p>
                    <p className="text-sm font-medium text-text-primary mt-1">{card.patient?.fullName}</p>
                    <p className="text-xs text-text-muted">{card.doctor?.fullName}</p>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                      <Clock className="w-3 h-3" /> {card.timeSlot}
                      {card.waitMinutes > 0 && <span className="text-amber-600">({card.waitMinutes} min)</span>}
                    </div>
                    {card.chiefComplaint && <p className="text-xs text-text-muted mt-1 truncate">{card.chiefComplaint}</p>}
                    <div className="flex gap-1 mt-2">
                      {col === 'scheduled' && <button onClick={() => handleStatus(card.id, 'checked_in')} className="flex-1 h-7 text-xs rounded bg-amber-50 text-amber-700 font-medium hover:bg-amber-100">Check In</button>}
                      {col === 'checked_in' && <button onClick={() => handleStatus(card.id, 'in_progress')} className="flex-1 h-7 text-xs rounded bg-purple-50 text-purple-700 font-medium hover:bg-purple-100">Start Visit</button>}
                      {col === 'in_progress' && <button onClick={() => handleStatus(card.id, 'completed')} className="flex-1 h-7 text-xs rounded bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100">Complete</button>}
                      {(col === 'checked_in' || col === 'scheduled') && <button onClick={() => handleStatus(card.id, 'cancelled')} className="h-7 px-2 text-xs rounded bg-red-50 text-red-700 font-medium hover:bg-red-100">Cancel</button>}
                      {(col === 'checked_in' || col === 'scheduled') && <button onClick={() => handleStatus(card.id, 'no_show')} className="h-7 px-2 text-xs rounded bg-slate-50 text-slate-700 font-medium hover:bg-slate-100">No Show</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
