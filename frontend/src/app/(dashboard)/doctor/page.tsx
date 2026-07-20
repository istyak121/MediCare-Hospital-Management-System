'use client';

import { Calendar, Clock, Users, FileText } from 'lucide-react';

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
        <p className="text-sm text-text-muted">Welcome back</p>
      </div>
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">
          Today&apos;s appointments and patient queue will appear here
        </div>
      </div>
    </div>
  );
}
