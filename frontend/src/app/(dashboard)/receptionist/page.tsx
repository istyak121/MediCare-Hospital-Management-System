'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTodayQueue } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import {
  Calendar, Users, Clock, UserPlus, CheckCircle, AlertTriangle, Plus, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ReceptionistDashboardPage() {
  const t = useTranslations('receptionist');
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const { data: queueData, isLoading: queueLoading } = useTodayQueue();
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 5 });

  const queue = Array.isArray(queueData) ? queueData : (queueData as any)?.data || [];
  const recentPatients = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || [];

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    checked_in: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    no_show: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'Scheduled',
    checked_in: 'Checked In',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Receptionist Dashboard</h1>
            <p className="text-sm text-text-muted">Today's appointment queue, patient registrations, and quick actions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/patients/new')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <UserPlus className="w-4 h-4" /> Register Patient
          </button>
          <button
            onClick={() => router.push('/appointments/new')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{queue.length}</p>
              <p className="text-sm text-text-muted">Today's Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{recentPatients.length}</p>
              <p className="text-sm text-text-muted">New Patients Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">
                {queue.filter((a: any) => a.status === 'checked_in').length}
              </p>
              <p className="text-sm text-text-muted">Waiting (Checked In)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">
                {queue.filter((a: any) => a.status === 'completed').length}
              </p>
              <p className="text-sm text-text-muted">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointment Queue */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Today's Queue — {new Date().toLocaleDateString()}</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-md border border-border bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search patient..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64 h-9 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                queue
                  .filter((a: any) => selectedStatus === 'all' || a.status === selectedStatus)
                  .filter((a: any) => !search || a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()))
                  .map((appt: any) => (
                    <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-bg-secondary/50">
                      <td className="px-4 py-3 text-sm font-mono text-text-muted">
                        {appt.timeSlot ? `${appt.timeSlot.startTime} - ${appt.timeSlot.endTime}` : appt.appointmentDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-text-primary">{appt.patient?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-text-muted">{appt.patient?.patientId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{appt.doctor?.fullName || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                          {appt.type || 'OPD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[appt.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {statusLabels[appt.status] || appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {appt.status === 'scheduled' && (
                            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                              <AlertTriangle className="w-3 h-3 inline mr-1" /> Check In
                            </button>
                          )}
                          {appt.status === 'checked_in' && (
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              Start Visit
                            </button>
                          )}
                          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">View</button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
              {!queueLoading && queue.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Calendar className="w-8 h-8 text-text-muted" />}
                      title="No appointments today"
                      description="Schedule new appointments or check back later."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-secondary">
          <span className="text-sm text-text-muted">
            Showing {queue.filter((a: any) => selectedStatus === 'all' || a.status === selectedStatus).length} of {queue.length} appointments
          </span>
        </div>
      </div>

      {/* Quick Actions + Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/appointments/new')}
              className="p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors text-center"
            >
              <Plus className="w-5 h-5 mx-auto mb-1 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">Book Appointment</span>
            </button>
            <button
              onClick={() => router.push('/patients/new')}
              className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-center"
            >
              <UserPlus className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Register Patient</span>
            </button>
            <button
              onClick={() => router.push('/billing/invoices/new')}
              className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-center"
            >
              <Calendar className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">New Invoice</span>
            </button>
            <button
              onClick={() => router.push('/admissions/new')}
              className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-center"
            >
              <Users className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Admit Patient</span>
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Patients</h2>
          {patientsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : recentPatients.length > 0 ? (
            <div className="space-y-3">
              {recentPatients.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{p.fullName}</p>
                      <p className="text-xs text-text-muted">{p.patientId} • {p.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/patients/${p.id}`)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-text-muted">
              <EmptyState
                icon={<Users className="w-8 h-8 text-text-muted" />}
                title="No patients today"
                description="New patient registrations will appear here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
