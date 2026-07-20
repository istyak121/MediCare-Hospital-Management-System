'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, Calendar, BedDouble, Banknote, FlaskConical, PillBottle } from 'lucide-react';

const statsCards = [
  { label: 'dashboard.total_patients', value: '0', icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'dashboard.total_appointments', value: '0', icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
  { label: 'dashboard.active_admissions', value: '0', icon: BedDouble, bg: 'bg-amber-50', color: 'text-amber-600' },
  { label: 'dashboard.revenue_today', value: '৳ 0', icon: Banknote, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'dashboard.pending_lab_tests', value: '0', icon: FlaskConical, bg: 'bg-orange-50', color: 'text-orange-600' },
  { label: 'dashboard.low_stock_medicines', value: '0', icon: PillBottle, bg: 'bg-red-50', color: 'text-red-600' },
];

export default function AdminDashboard() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('quick_actions')}</h1>
        <p className="text-sm text-text-muted">Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{card.value}</p>
                  <p className="text-sm text-text-muted">{t(card.label.split('.')[1])}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            Charts will render here (Recharts)
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            Activity feed will render here
          </div>
        </div>
      </div>
    </div>
  );
}
