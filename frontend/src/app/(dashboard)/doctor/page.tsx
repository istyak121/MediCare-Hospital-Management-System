'use client';

import { Calendar, Clock, Users, FileText, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const today = new Date().toISOString().split('T')[0];

export default function DoctorDashboard() {
  const { data: apptsData, isLoading } = useQuery({
    queryKey: ['doctor-appointments', today],
    queryFn: () => apiFetch(`/appointments?date=${today}`),
  });
  const appointments = Array.isArray(apptsData) ? apptsData : (apptsData as any)?.data || [];

  const seenCount = appointments.filter((a: any) => a.status === 'completed' || a.status === 'in_progress').length;
  const pendingLab = appointments.filter((a: any) => a.status === 'checked_in').length;
  const rxToday = appointments.filter((a: any) => a.prescriptionId).length;

  const quickStats = [
    { label: "Today's Appointments", value: isLoading ? '-' : String(appointments.length), icon: Calendar, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Patients Seen', value: isLoading ? '-' : String(seenCount), icon: Users, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Checked In', value: isLoading ? '-' : String(pendingLab), icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Prescriptions Today', value: isLoading ? '-' : String(rxToday), icon: FileText, bg: 'bg-purple-50', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
            <p className="text-sm text-text-muted">Your patients, appointments & quick actions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Today&apos;s Schedule — {today}</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
            <Calendar className="w-8 h-8" />
            <p>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 10).map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                <div>
                  <p className="text-sm font-medium text-text-primary">{apt.patient?.fullName || 'Unknown'}</p>
                  <p className="text-xs text-text-muted">{apt.timeSlot || apt.appointmentDate} — {apt.type || 'OPD'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  apt.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                  apt.status === 'checked_in' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-600'
                }`}>{apt.status?.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
