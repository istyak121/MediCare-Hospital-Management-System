'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTranslations } from 'next-intl';
import { Calendar, FileText, FlaskConical, Receipt, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const menuItems = [
  { label: 'My Appointments', href: '/portal/appointments', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  { label: 'My Prescriptions', href: '/portal/prescriptions', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Lab Reports', href: '/portal/lab-reports', icon: FlaskConical, color: 'bg-purple-50 text-purple-600' },
  { label: 'My Bills', href: '/portal/bills', icon: Receipt, color: 'bg-amber-50 text-amber-600' },
  { label: 'My Profile', href: '/portal/profile', icon: User, color: 'bg-primary-50 text-primary-600' },
];

export default function PatientPortalPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Welcome, {user?.email || 'Patient'}</h1>
            <p className="text-sm text-text-muted">Patient Portal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="bg-white rounded-lg border border-border shadow-sm p-6 hover:shadow-md transition-shadow text-left group">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary-600">{item.label}</h3>
              <p className="text-xs text-text-muted mt-1">View and manage your {item.label.toLowerCase()}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
