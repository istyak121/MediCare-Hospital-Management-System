'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

export default function PortalAppointments() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: () => apiFetch('/appointments'),
  });
  const apts = (data as any)?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">My Appointments</h1>
      {isLoading ? <p className="text-text-muted">Loading...</p> : apts.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apts.map((apt: any) => (
            <div key={apt.id} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{apt.doctor?.fullName || 'Unknown doctor'}</p>
                  <p className="text-xs text-text-muted">{apt.chiefComplaint || 'No complaint'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary capitalize">{apt.status?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(apt.appointmentDate)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.timeSlot}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
