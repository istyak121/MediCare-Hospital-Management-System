'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

const DAYS = [
  { num: 0, short: 'Sun', label: 'Sunday' },
  { num: 1, short: 'Mon', label: 'Monday' },
  { num: 2, short: 'Tue', label: 'Tuesday' },
  { num: 3, short: 'Wed', label: 'Wednesday' },
  { num: 4, short: 'Thu', label: 'Thursday' },
  { num: 5, short: 'Fri', label: 'Friday' },
  { num: 6, short: 'Sat', label: 'Saturday' },
];

export function ScheduleCalendar({ doctorId }: { doctorId: string }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '17:00', slotDuration: 20, maxPatients: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', doctorId],
    queryFn: () => apiFetch(`/schedules/doctor/${doctorId}`),
    enabled: !!doctorId,
  });

  const schedules = Array.isArray(data) ? data : (data as any)?.data || [];

  const saveMutation = useMutation({
    mutationFn: async (allSchedules: any[]) => {
      return apiFetch(`/schedules/doctor/${doctorId}`, {
        method: 'PUT',
        body: JSON.stringify({ schedules: allSchedules }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules', doctorId] });
      toast.success('Schedule updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update schedule'),
  });

  const addSlot = (dayNum: number) => {
    const newSchedule = {
      dayOfWeek: dayNum,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      slotDuration: newSlot.slotDuration,
      maxPatients: newSlot.maxPatients,
      isActive: true,
    };
    const updated = [...schedules.filter((s: any) => s.dayOfWeek !== dayNum), newSchedule];
    saveMutation.mutate(updated);
    setAdding(null);
  };

  const removeSlot = (dayNum: number) => {
    const updated = schedules.filter((s: any) => s.dayOfWeek !== dayNum);
    saveMutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slot duration + max patients config */}
      <div className="flex flex-wrap items-end gap-3 bg-bg-secondary rounded-lg p-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Start Time</label>
          <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">End Time</label>
          <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Slot (min)</label>
          <input type="number" value={newSlot.slotDuration} onChange={e => setNewSlot({ ...newSlot, slotDuration: parseInt(e.target.value) || 20 })} className="w-20 h-9 px-2 rounded-md border border-border bg-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Max Patients</label>
          <input type="number" value={newSlot.maxPatients} onChange={e => setNewSlot({ ...newSlot, maxPatients: parseInt(e.target.value) || 1 })} className="w-24 h-9 px-2 rounded-md border border-border bg-white text-sm" />
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS.map(day => {
          const daySchedule = schedules.find((s: any) => s.dayOfWeek === day.num);
          const isAdding = adding === String(day.num);

          return (
            <div key={day.num} className={cn(
              'bg-white rounded-lg border p-3 min-h-[120px] flex flex-col',
              daySchedule ? 'border-primary-200' : 'border-border',
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-primary">{day.short}</span>
                {daySchedule && (
                  <button onClick={() => removeSlot(day.num)} className="text-text-muted hover:text-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {daySchedule ? (
                <div className="space-y-1 text-xs text-text-secondary">
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {daySchedule.startTime} - {daySchedule.endTime}
                  </p>
                  <p>Slots of {daySchedule.slotDuration} min</p>
                  <p>Max {daySchedule.maxPatients} patient(s)</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Available
                  </span>
                </div>
              ) : isAdding ? (
                <div className="space-y-2 flex-1">
                  <button
                    onClick={() => addSlot(day.num)}
                    disabled={saveMutation.isPending}
                    className="w-full h-8 rounded-md bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Confirm'}
                  </button>
                  <button onClick={() => setAdding(null)} className="w-full h-8 rounded-md border border-border text-xs text-text-secondary hover:bg-bg-tertiary">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(String(day.num))}
                  className="flex-1 flex items-center justify-center text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">
          No schedule set. Click + on any day to add availability.
        </p>
      )}
    </div>
  );
}
