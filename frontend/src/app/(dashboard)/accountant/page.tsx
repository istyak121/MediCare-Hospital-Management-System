'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePatientStats, useRevenue, useBedOccupancy } from '@/hooks/useReports';
import { useDailyCollection, useOutstandingBills } from '@/hooks/useBilling';
import { useLowStock } from '@/hooks/usePharmacy';
import {
  LayoutDashboard, Users, Calendar, BedDouble, Banknote, FlaskConical, PillBottle,
  TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Receipt
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const paymentMethods = ['cash', 'card', 'bKash', 'nagad', 'bank', 'other'];

export default function AccountantPage() {
  const t = useTranslations('billing');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenue(30);
  const { data: occupancy, isLoading: occupancyLoading } = useBedOccupancy();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStock();
  const { data: collection, isLoading: collectionLoading } = useDailyCollection(selectedDate);
  const { data: outstanding, isLoading: outstandingLoading } = useOutstandingBills();

  const lowStockCount = lowStock?.length || 0;
  const pendingLabCount = 0; // Would need lab tests hook
  const totalOutstanding = outstanding?.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount || 0), 0) || 0;
  const overdueInvoices = outstanding?.filter((inv: any) => new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' && inv.status !== 'CANCELLED').length || 0;

  const totalAmount = collection?.reduce((sum: number, item: any) => sum + Number(item.totalAmount || 0), 0) || 0;
  const totalCount = collection?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;

  const isLoading = statsLoading || revenueLoading || occupancyLoading || lowStockLoading || collectionLoading || outstandingLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('accountantDashboard')}</h1>
            <p className="text-sm text-text-muted">{t('accountantDashboardDesc')}</p>
          </div>
        </div>
      </div>

      {/* Stats Row - 6 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <>
            {[1,2,3,4,5,6].map(i => (
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
                  <p className="text-sm text-text-muted">{t('totalPatients')}</p>
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
                  <p className="text-sm text-text-muted">{t('todayAppointments')}</p>
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
                  <p className="text-sm text-text-muted">{t('activeAdmissions')}</p>
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
                  <p className="text-sm text-text-muted">{t('revenue30d')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{pendingLabCount}</p>
                  <p className="text-sm text-text-muted">{t('pendingLabTests')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <PillBottle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">{lowStockCount}</p>
                  <p className="text-sm text-text-muted">{t('lowStockMedicines')}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Revenue Overview + Daily Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              {t('revenueOverview')}
            </h2>
            <select
              value={30}
              onChange={e => {}}
              className="h-9 px-3 rounded-md border border-border bg-white text-sm"
            >
              <option value="7">{t('last7Days')}</option>
              <option value="30">{t('last30Days')}</option>
              <option value="90">{t('last90Days')}</option>
            </select>
          </div>
          {revenueLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : revenue ? (
            <div className="flex items-center justify-around h-32">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(revenue.total)}</p>
                <p className="text-sm text-text-muted">{t('totalRevenue')}</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700">{revenue.count}</p>
                <p className="text-sm text-text-muted">{t('transactionCount')}</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-text-primary">{revenue.days}d</p>
                <p className="text-sm text-text-muted">{t('period')}</p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-text-muted text-sm">No revenue data</div>
          )}
        </div>

        {/* Daily Collection */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-600" />
              {t('dailyCollection')}
            </h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <CalendarIcon className="w-4 h-4" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="h-9 px-3 rounded-md border border-border bg-white text-sm"
                />
              </label>
              <button className="h-9 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          {collectionLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-emerald-600">{t('totalCollected')}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{totalCount}</p>
                  <p className="text-xs text-blue-600">{t('totalTransactions')}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700">{selectedDate ? formatDate(selectedDate) : '—'}</p>
                  <p className="text-xs text-purple-600">{t('selectedDate')}</p>
                </div>
              </div>
              {collection && collection.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary">{t('paymentMethodBreakdown')}</h3>
                  {['cash', 'card', 'bKash', 'nagad', 'bank', 'other'].map(method => {
                    const methodData = collection.find((d: any) => d.method === method);
                    if (!methodData) return null;
                    return (
                      <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50">
                        <span className="text-sm font-medium text-text-primary capitalize">{method}</span>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>{methodData.count} {t('transactions')}</span>
                          <span className="font-semibold text-text-primary">{formatCurrency(methodData.totalAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-text-muted">
                  <p>No collections for this date</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Outstanding Bills + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Bills */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              {t('outstandingBills')}
            </h2>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 font-medium">{overdueInvoices} {t('overdue')}</span>
            </div>
          </div>
          {outstandingLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : outstanding && outstanding.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(totalOutstanding)}</p>
                  <p className="text-sm text-red-600">{t('totalOutstanding')}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-amber-700">{outstanding.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED').length}</p>
                  <p className="text-sm text-amber-600">{t('pendingInvoices')}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{overdueInvoices}</p>
                  <p className="text-sm text-red-600">{t('overdueInvoices')}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('invoiceNo')}</th>
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('patient')}</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">{t('due')}</th>
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('status')}</th>
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('dueDate')}</th>
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('daysOverdue')}</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {outstanding.slice(0, 10).map((inv: any) => {
                      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isOverdue = dueDate && dueDate < today && inv.status !== 'PAID' && inv.status !== 'CANCELLED';
                      const daysOverdue = dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <tr key={inv.id} className={`hover:bg-bg-secondary/50 ${isOverdue ? 'bg-red-50' : ''}`}>
                          <td className="py-2.5 px-3 text-sm font-mono text-text-muted">{inv.invoiceNo}</td>
                          <td className="py-2.5 px-3">
                            <div className="text-sm font-medium text-text-primary">{inv.patient?.fullName || '-'}</div>
                            <div className="text-xs text-text-muted">{inv.patient?.patientId}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-700">{formatCurrency(inv.dueAmount)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : inv.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : inv.status === 'PARTIAL_PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {inv.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-text-muted">{inv.dueDate ? formatDate(inv.dueDate) : '-'}</td>
                          <td className="py-2.5 px-3">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                {daysOverdue} {t('daysOverdue')}
                              </span>
                            ) : (
                              <span className="text-text-muted">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">{t('view')}</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-text-muted">
              <p>No outstanding bills</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <PillBottle className="w-5 h-5 text-red-600" />
            {t('lowStockAlerts')}
          </h2>
          {lowStockLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : lowStock && lowStock.length > 0 ? (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('medicine')}</th>
                      <th className="text-left py-2 px-3 font-medium text-text-muted">{t('category')}</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">{t('stock')}</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">{t('reorderLevel')}</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">{t('supplier')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lowStock.map((med: any) => (
                      <tr key={med.id} className="hover:bg-bg-secondary/50 bg-red-50/50">
                        <td className="py-2.5 px-3 font-medium text-text-primary">{med.name}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{med.category}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-red-700">{med.stockQuantity}</td>
                        <td className="py-2.5 px-3 text-right text-text-muted">{med.reorderLevel}</td>
                        <td className="py-2.5 px-3 text-right text-text-muted">{med.supplier || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-text-muted">
              <p>No low stock medicines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
