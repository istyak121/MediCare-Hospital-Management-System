'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BarChart3, Users, Calendar, BedDouble, Banknote, Stethoscope, TrendingUp, Activity, Building2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
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

  const revenueEntries = revenue?.byDate
    ? Object.entries(revenue.byDate).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const maxRevenue = Math.max(...revenueEntries.map(([, v]) => v), 1);

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

      {/* Patient Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          {tr('patientStats')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
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
            </>
          )}
        </div>
      </div>

      {/* Bed Occupancy */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
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
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 bg-bg-secondary rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(occupancy.available / occupancy.total) * 100}%` }}
                    title={`${tr('available')}: ${occupancy.available}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(occupancy.occupied / occupancy.total) * 100}%` }}
                    title={`${tr('occupied')}: ${occupancy.occupied}`}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(occupancy.reserved / occupancy.total) * 100}%` }}
                    title={`${tr('reserved')}: ${occupancy.reserved}`}
                  />
                  <div
                    className="h-full bg-gray-400 transition-all"
                    style={{ width: `${(occupancy.maintenance / occupancy.total) * 100}%` }}
                    title={`${tr('maintenance')}: ${occupancy.maintenance}`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <AlertCircle className="w-4 h-4" />
            {tr('noData')}
          </div>
        )}
      </div>

      {/* Revenue */}
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
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : revenue ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(revenue.total)}</p>
                <p className="text-xs text-emerald-600">{tr('totalRevenue')}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{revenue.count}</p>
                <p className="text-xs text-blue-600">{tr('transactionCount')}</p>
              </div>
            </div>

            {revenueEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">{tr('dailyBreakdown')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-text-muted">{tr('date')}</th>
                        <th className="text-right py-2 px-3 font-medium text-text-muted">{tr('amount')}</th>
                        <th className="w-1/2 py-2 px-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {revenueEntries.slice(-14).map(([date, amount]) => (
                        <tr key={date} className="hover:bg-bg-secondary/50">
                          <td className="py-2 px-3 text-text-primary">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">{formatCurrency(amount)}</td>
                          <td className="py-2 px-3">
                            <div className="h-4 bg-emerald-100 rounded-full overflow-hidden" style={{ width: `${Math.max((amount / maxRevenue) * 100, 4)}%` }}>
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {revenueEntries.length > 14 && (
                    <p className="text-xs text-text-muted text-center mt-2">
                      Showing last 14 of {revenueEntries.length} days
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <AlertCircle className="w-4 h-4" />
            {tr('noData')}
          </div>
        )}
      </div>

      {/* Top Diagnoses */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary-600" />
          {tr('topDiagnoses')}
        </h2>
        {diagnosesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : diagnoses && diagnoses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-text-muted w-10">#</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{tr('diagnosis')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted">{tr('cases')}</th>
                  <th className="w-1/3 py-2 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {diagnoses.map((d, i) => {
                  const maxCount = Math.max(...diagnoses.map(x => x.count));
                  return (
                    <tr key={i} className="hover:bg-bg-secondary/50">
                      <td className="py-2.5 px-3 text-text-muted">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{d.diagnosis}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-primary">{d.count}</td>
                      <td className="py-2.5 px-3">
                        <div className="h-5 bg-primary-50 rounded-full overflow-hidden" style={{ width: `${(d.count / maxCount) * 100}%` }}>
                          <div className="h-full bg-primary-500 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <AlertCircle className="w-4 h-4" />
            {tr('noData')}
          </div>
        )}
      </div>
    </div>
  );
}
