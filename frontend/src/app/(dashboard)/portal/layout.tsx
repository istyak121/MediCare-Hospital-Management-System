'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, FileText, FlaskConical, Receipt, User, LogOut } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const menuItems = [
    { href: '/portal', label: 'Dashboard', icon: User },
    { href: '/portal/appointments', label: 'Appointments', icon: Calendar },
    { href: '/portal/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/portal/lab-reports', label: 'Lab Reports', icon: FlaskConical },
    { href: '/portal/bills', label: 'Bills', icon: Receipt },
    { href: '/portal/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="font-semibold text-text-primary">MediCare Portal</span>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }} className="p-2 rounded-md text-text-secondary hover:bg-bg-tertiary">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-border p-3 hidden md:block">
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary">
                  <Icon className="w-5 h-5" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex md:hidden z-40">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex-1 flex flex-col items-center py-2 text-xs text-text-muted">
                <Icon className="w-5 h-5 mb-1" /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 md:ml-64 p-4 pb-20 md:pb-4">
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
