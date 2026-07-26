'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, Calendar, BedDouble, Banknote, FlaskConical, PillBottle, TrendingUp } from 'lucide-react';
import { usePatientStats, useRevenue } from '@/hooks/useReports';
import { useLowStock } from '@/hooks/usePharmacy';
import { useLabTests } from '@/hooks/useLabTests';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const t = useTranslations('dashboard');
  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenue(30);
  const { data: lowStock, isLoading: lowStockLoading } = useLowStock();
  const { data: labData, isLoading: labLoading } = useLabTests({ status: 'requested' });

  const pendingLabCount = labData?.data?.length || 0;
  const lowStockCount = lowStock?.length || 0;

  const todayStr = new Date().toISOString().split('T')[0];

  const isLoading = statsLoading || revenueLoading || lowStockLoading || labLoading;

  const statsCards = [
    { label: 'dashboard.total_patients', value: isLoading ? '' : String(stats?.totalPatients ?? 0), icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'dashboard.total_appointments', value: isLoading ? '' : String(stats?.todayAppointments ?? 0), icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'dashboard.active_admissions', value: isLoading ? '' : String(stats?.activeAdmissions ?? 0), icon: BedDouble, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'dashboard.revenue_today', value: isLoading ? '' : formatCurrency(revenue?.total ?? 0), icon: Banknote, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'dashboard.pending_lab_tests', value: isLoading ? '' : String(pendingLabCount), icon: FlaskConical, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'dashboard.low_stock_medicines', value: isLoading ? '' : String(lowStockCount), icon: PillBottle, bg: 'bg-red-50', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-sm text-text-muted">Hospital overview & quick actions — {todayStr}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  {isLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-text-primary">{card.value}</p>
                      <p className="text-sm text-text-muted">{t(card.label.split('.')[1])}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Revenue (30d)
          </h3>
          {revenueLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : revenue ? (
            <div className="flex items-center justify-around h-32">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(revenue.total)}</p>
                <p className="text-sm text-text-muted">Total</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700">{revenue.count}</p>
                <p className="text-sm text-text-muted">Transactions</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-text-primary">{revenue.days}d</p>
                <p className="text-sm text-text-muted">Period</p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-text-muted text-sm">No revenue data</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/appointments/new" className="p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">New Appointment</span>
            </a>
            <a href="/patients/new" className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Register Patient</span>
            </a>
            <a href="/admissions/new" className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-center">
              <BedDouble className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Admit Patient</span>
            </a>
            <a href="/billing/invoices/new" className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-center">
              <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">New Invoice</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
