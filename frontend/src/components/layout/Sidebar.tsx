'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, BedDouble, PillBottle,
  FlaskConical, Receipt, UserCog, BarChart3, Settings,
  ClipboardList, Stethoscope, Syringe, Activity, CalendarClock,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'nav.dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'accountant'] },
      { label: 'nav.patients', href: '/patients', icon: <Users className="w-5 h-5" />, roles: ['super_admin', 'admin', 'receptionist', 'doctor'] },
      { label: 'nav.appointments', href: '/appointments', icon: <Calendar className="w-5 h-5" />, roles: ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse'] },
      { label: 'nav.schedules', href: '/schedules', icon: <CalendarClock className="w-5 h-5" />, roles: ['super_admin', 'admin', 'doctor'] },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { label: 'nav.admissions', href: '/admissions', icon: <BedDouble className="w-5 h-5" />, roles: ['super_admin', 'admin', 'receptionist', 'nurse'] },
      { label: 'nav.pharmacy', href: '/pharmacy', icon: <PillBottle className="w-5 h-5" />, roles: ['super_admin', 'admin', 'pharmacist'] },
      { label: 'nav.laboratory', href: '/lab', icon: <FlaskConical className="w-5 h-5" />, roles: ['super_admin', 'admin', 'lab_technician', 'doctor'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'nav.billing', href: '/billing', icon: <Receipt className="w-5 h-5" />, roles: ['super_admin', 'admin', 'accountant', 'receptionist'] },
      { label: 'nav.staff', href: '/staff', icon: <UserCog className="w-5 h-5" />, roles: ['super_admin', 'admin'] },
      { label: 'nav.reports', href: '/reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['super_admin', 'admin', 'accountant'] },
      { label: 'nav.settings', href: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['super_admin', 'admin'] },
    ],
  },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isCollapsed } = useSidebarStore();

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => user?.role && item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-border transition-all duration-300 z-30 overflow-y-auto',
        isCollapsed ? 'w-[72px]' : 'w-[280px]',
      )}
    >
      <nav className="p-3 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
                    )}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{t(item.label.split('.')[1])}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
