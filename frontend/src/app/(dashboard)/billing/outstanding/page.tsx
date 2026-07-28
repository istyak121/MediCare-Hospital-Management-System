'use client';

import { useTranslations } from 'next-intl';
import { useOutstandingBills } from '@/hooks/useBilling';
import { Receipt, ChevronLeft, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PARTIAL_PAID: 'bg-blue-50 text-blue-700 border-blue-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const typeColors = {
  OPD: 'bg-blue-50 text-blue-700 border-blue-200',
  IPD: 'bg-purple-50 text-purple-700 border-purple-200',
  PHARMACY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LAB: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function OutstandingBillsPage() {
  const t = useTranslations('billing');

  const { data, isLoading } = useOutstandingBills();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('outstandingBills')}</h1>
            <p className="text-sm text-text-muted">{t('outstandingBillsDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 font-medium">{t('overdue')}</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{data?.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount || 0), 0) || 0}</p>
            <p className="text-sm text-red-600">{t('totalOutstanding')}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-700">{data?.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED').length || 0}</p>
            <p className="text-sm text-amber-600">{t('pendingInvoices')}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{data?.filter((inv: any) => new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' && inv.status !== 'CANCELLED').length || 0}</p>
            <p className="text-sm text-red-600">{t('overdueInvoices')}</p>
          </div>
        </div>
      </div>

      {/* Outstanding Bills Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('outstandingList')}</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('invoiceNo')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('patient')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('type')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted">{t('total')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted">{t('paid')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted text-danger">{t('due')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('status')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('dueDate')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('daysOverdue')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((inv: any) => {
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
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[inv.invoiceType as keyof typeof typeColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {inv.invoiceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-primary">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-2.5 px-3 text-right text-text-primary">{formatCurrency(inv.paidAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-700">{formatCurrency(inv.dueAmount)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[inv.status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
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
        ) : (
          <div className="flex items-center justify-center h-40 text-text-muted">
            <EmptyState
              icon={<Receipt className="w-12 h-12 text-text-muted" />}
              title="No outstanding bills"
              description="All invoices are paid up to date."
            />
          </div>
        )}
      </div>
    </div>
  );
}
