'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const roleRoutes: Record<string, string> = {
      super_admin: '/admin',
      admin: '/admin',
      doctor: '/doctor',
      nurse: '/nurse',
      receptionist: '/receptionist',
      pharmacist: '/pharmacy',
      lab_technician: '/lab',
      accountant: '/accountant',
      patient: '/portal',
    };

    router.push(roleRoutes[user.role] || '/admin');
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
