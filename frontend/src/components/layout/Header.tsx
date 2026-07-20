'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useThemeStore } from '@/stores/themeStore';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Menu, Bell, Sun, Moon, LogOut, User, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('common');
  const { user, logout: clearAuth } = useAuthStore();
  const { toggleCollapsed, toggleMobile } = useSidebarStore();
  const { isDark, toggleDark } = useThemeStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo + Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-md hover:bg-bg-tertiary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:block p-2 rounded-md hover:bg-bg-tertiary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="font-semibold text-text-primary hidden sm:block">
              MediCare HMS
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            className="p-2 rounded-md hover:bg-bg-tertiary text-text-secondary"
            title={t('language')}
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-md hover:bg-bg-tertiary text-text-secondary"
            title={t('dark_mode')}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-bg-tertiary text-text-secondary">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-text-muted capitalize">
                {user?.role?.replace('_', ' ') || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-red-50 text-text-secondary hover:text-danger ml-1"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
