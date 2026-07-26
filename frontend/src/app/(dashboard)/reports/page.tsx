'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart3, Users, Calendar, BedDouble, Banknote, Stethoscope, Building2,
  CheckCircle, XCircle, AlertCircle, ReceiptText, Percent
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { usePatientStats, useRevenue, useBedOccupancy, useTopDiagnoses } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const tr = useTranslations('reports');
  const td = useTranslations('dashboard');
  const [revenueDays, setRevenueDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenue(revenueDays);
  const { data: occupancy, isLoading: occupancyLoading } = useBedOccupancy();
  const { data: diagnoses, isLoading: diagnosesLoading } = useTopDiagnoses();

  const periodOptions = [
    { value: 7, label: tr('last7Days') },
    { value: 30, label: tr('last30Days') },
    { value: 90, label: tr('last90Days') },
  ];

  const chartData = revenue?.byDate
    ? Object.entries(revenue.byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30)
        .map(([date, amount]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount,
        }))
    : [];

  const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <Skeleton className="h-10 w-10 rounded-xl mb-3" />
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-4 w-28" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{tr('title')}</h1>
            <p className="text-sm text-text-muted">{tr('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Top Stats Row — 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{stats?.totalPatients ?? 0}</p>
                  <p className="text-sm text-text-muted">{td('totalPatients')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{stats?.todayAppointments ?? 0}</p>
                  <p className="text-sm text-text-muted">{td('todayAppointments')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BedDouble className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{stats?.activeAdmissions ?? 0}</p>
                  <p className="text-sm text-text-muted">{td('activeAdmissions')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{revenue ? formatCurrency(revenue.total) : '—'}</p>
                  <p className="text-sm text-text-muted">{tr('totalRevenue')} ({revenueDays}d)</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ReceiptText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{revenue?.count ?? 0}</p>
                  <p className="text-sm text-text-muted">{tr('transactionCount')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{occupancy?.occupancyRate ?? 0}%</p>
                  <p className="text-sm text-text-muted">{tr('occupancyRate')}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Row — 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column — Revenue Chart */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary-600" />
              {tr('revenueOverview')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">{tr('period')}:</span>
              <select
                value={revenueDays}
                onChange={e => setRevenueDays(Number(e.target.value))}
                className="h-9 px-3 rounded-md border border-border bg-white text-sm"
              >
                {periodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {revenueLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `৳${v}`} width={60} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
              <AlertCircle className="w-8 h-8" />
              <p>{tr('noData')}</p>
            </div>
          )}
        </div>

        {/* Right Column — Bed Occupancy + Top Diagnoses */}
        <div className="flex flex-col gap-6">
          {/* Bed Occupancy Detail */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              {tr('bedOccupancy')}
            </h2>
            {occupancyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-full rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : occupancy ? (
              <div className="space-y-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-text-primary">{occupancy.occupancyRate}%</p>
                    <p className="text-xs text-text-muted">{tr('occupancyRate')}</p>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <div className="h-4 bg-bg-secondary rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(occupancy.available / occupancy.total) * 100}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${(occupancy.occupied / occupancy.total) * 100}%` }} />
                      <div className="h-full bg-blue-500" style={{ width: `${(occupancy.reserved / occupancy.total) * 100}%` }} />
                      <div className="h-full bg-gray-400" style={{ width: `${(occupancy.maintenance / occupancy.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-text-muted">{tr('available')}:</span>
                    <span className="font-semibold text-text-primary">{occupancy.available}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-text-muted">{tr('occupied')}:</span>
                    <span className="font-semibold text-text-primary">{occupancy.occupied}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-text-muted">{tr('reserved')}:</span>
                    <span className="font-semibold text-text-primary">{occupancy.reserved}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-text-muted">{tr('maintenance')}:</span>
                    <span className="font-semibold text-text-primary">{occupancy.maintenance}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted">{tr('totalBeds')}: {occupancy.total}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <AlertCircle className="w-4 h-4" />
                {tr('noData')}
              </div>
            )}
          </div>

          {/* Top Diagnoses */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              {tr('topDiagnoses')}
            </h2>
            {diagnosesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : diagnoses && diagnoses.length > 0 ? (
              <div className="space-y-2">
                {diagnoses.map((d, i) => {
                  const maxCount = Math.max(...diagnoses.map(x => x.count));
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-5 text-text-muted text-xs font-medium">{i + 1}.</span>
                      <span className="flex-1 text-text-primary truncate">{d.diagnosis}</span>
                      <span className="font-semibold text-text-primary w-10 text-right">{d.count}</span>
                      <div className="w-20 h-3 bg-primary-50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <AlertCircle className="w-4 h-4" />
                {tr('noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
