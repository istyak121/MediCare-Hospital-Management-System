'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

// Client-side route access rules (mirrors middleware.ts)
const routeRoleMap: Record<string, string[]> = {
  '/admin': ['super_admin', 'admin'],
  '/doctor': ['doctor'],
  '/nurse': ['nurse'],
  '/receptionist': ['receptionist'],
  '/pharmacy': ['pharmacist'],
  '/lab': ['lab_technician'],
  '/accountant': ['accountant'],
  '/portal': ['patient'],
  '/patients': ['super_admin', 'admin', 'receptionist', 'doctor'],
  '/appointments': ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse'],
  '/billing': ['super_admin', 'admin', 'receptionist', 'accountant'],
  '/prescriptions': ['super_admin', 'admin', 'doctor', 'nurse'],
  '/staff': ['super_admin', 'admin'],
  '/admissions': ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse'],
  '/schedules': ['super_admin', 'admin', 'doctor'],
  '/reports': ['super_admin', 'admin', 'accountant'],
  '/settings': ['super_admin', 'admin'],
};

const roleDefaultRoute: Record<string, string> = {
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

function getMatchingRoute(pathname: string): string | null {
  const stripped = pathname.replace(/^\/(en|bn)(?:\/|$)/, '/');
  const keys = Object.keys(routeRoleMap).sort((a, b) => b.length - a.length); // longer first
  for (const key of keys) {
    if (stripped === key || stripped.startsWith(key + '/')) return key;
  }
  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role-based route access
    const matchedRoute = getMatchingRoute(pathname);
    if (matchedRoute && user) {
      const allowedRoles = routeRoleMap[matchedRoute];
      if (!allowedRoles.includes(user.role)) {
        const defaultRoute = roleDefaultRoute[user.role] || '/login';
        router.push(defaultRoute);
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main
        className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]',
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
