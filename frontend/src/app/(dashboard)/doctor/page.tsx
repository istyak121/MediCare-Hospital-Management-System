'use client';

import { Calendar, Clock, Users, FileText, Stethoscope } from 'lucide-react';

export default function DoctorDashboard() {
  const quickStats = [
    { label: "Today's Appointments", value: '0', icon: Calendar, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Patients Seen', value: '0', icon: Users, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Pending Lab Tests', value: '0', icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Prescriptions Today', value: '0', icon: Clock, bg: 'bg-purple-50', color: 'text-purple-600' },
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

      {/* Quick stats */}
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

      {/* Today's schedule placeholder */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Today&apos;s Schedule</h3>
        <div className="h-48 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
            <Calendar className="w-6 h-6 text-text-muted" />
          </div>
          <p>Your appointments for today will appear here</p>
        </div>
      </div>
    </div>
  );
}
