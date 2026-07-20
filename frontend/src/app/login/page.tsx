'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(email, password);
      const user = result.user;

      login(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        (result as any).accessToken || '',
      );

      // Role-based redirect
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

      router.push(roleRoutes[user.role] || '/');
    } catch (err: any) {
      setError(err.message || t('invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-4">
          <LogIn className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{t('login_title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('login_subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {t('email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@medicare.com"
            required
            className="w-full h-10 px-3 rounded-md border border-border bg-white text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-text-muted disabled:bg-bg-secondary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {t('password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-white text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-text-muted"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-danger text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full h-10 px-4 rounded-md text-sm font-medium transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2',
          )}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('login_button')}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-text-muted mt-6">
        MediCare HMS v1.0
      </p>
    </div>
  );
}
