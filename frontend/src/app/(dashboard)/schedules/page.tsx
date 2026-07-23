'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { ScheduleCalendar } from '@/components/schedule/ScheduleCalendar';
import { Stethoscope, Calendar } from 'lucide-react';

export default function SchedulesPage() {
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiFetch('/staff/doctors'),
  });

  const doctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Doctor Schedules</h1>
            <p className="text-sm text-text-muted">Manage weekly availability and time slots</p>
          </div>
        </div>
      </div>

      {/* Doctor selector */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-4">
        <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" /> Select Doctor
        </label>
        <select
          value={selectedDoctor}
          onChange={e => setSelectedDoctor(e.target.value)}
          className="w-full max-w-md h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose a doctor...</option>
          {doctors.map((doc: any) => (
            <option key={doc.id} value={doc.id}>
              {doc.fullName} — {doc.specialization} ({doc.department?.name || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      {selectedDoctor ? (
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Weekly Schedule</h2>
          <ScheduleCalendar doctorId={selectedDoctor} />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border shadow-sm p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-text-muted mb-3" />
            <p className="text-text-muted">Select a doctor to manage their weekly schedule</p>
          </div>
        </div>
      )}
    </div>
  );
}
