'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDailyCollection } from '@/hooks/useBilling';
import { Banknote, ChevronLeft, ChevronRight, Calendar, Download, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DailyCollectionPage() {
  const t = useTranslations('billing');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useDailyCollection(date);

  const paymentMethods = ['cash', 'card', 'bKash', 'nagad', 'bank', 'other'];

  const totalAmount = data?.reduce((sum: number, item: any) => sum + Number(item.totalAmount || 0), 0) || 0;
  const totalCount = data?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('dailyCollection')}</h1>
            <p className="text-sm text-text-muted">{t('dailyCollectionDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-white text-sm"
            />
          </label>
          <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
              <p className="text-sm text-text-muted">{t('totalCollected')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalCount}</p>
              <p className="text-sm text-text-muted">{t('totalTransactions')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{date ? formatDate(date) : '—'}</p>
              <p className="text-sm text-text-muted">{t('selectedDate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('paymentMethodBreakdown')}</h2>
        {isLoading ? (
          <div className="space-y-3">
            {paymentMethods.map(m => (
              <Skeleton key={m} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map(method => {
              const methodData = data.find((d: any) => d.method === method);
              const count = methodData?.count || 0;
              const amount = methodData?.totalAmount || 0;
              if (!methodData) return null;
              return (
                <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary capitalize">{method}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{count} {t('transactions')}</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-text-muted">
            <EmptyState
              icon={<Banknote className="w-12 h-12 text-text-muted" />}
              title="No collections for this date"
              description="Select a different date to view payment collections."
            />
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('transactionList')}</h2>
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
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('invoice')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('patient')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('method')}</th>
                  <th className="text-right py-2 px-3 font-medium text-text-muted">{t('amount')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('receivedAt')}</th>
                  <th className="text-left py-2 px-3 font-medium text-text-muted">{t('transactionId')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.flatMap((d: any) => (d.payments || []).map((p: any, idx: number) => (
                  <tr key={`${d.id}-${idx}`} className="hover:bg-bg-secondary/50">
                    <td className="py-2.5 px-3 text-sm font-mono text-text-muted">{d.invoiceNo}</td>
                    <td className="py-2.5 px-3 text-text-primary">{d.patient?.fullName || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 capitalize">{p.method}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-text-primary">{formatCurrency(p.amount)}</td>
                    <td className="py-2.5 px-3 text-text-muted">{formatDate(p.receivedAt)}</td>
                    <td className="py-2.5 px-3 text-sm font-mono text-text-muted">{p.transactionId || '-'}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-text-muted">
            <EmptyState
              icon={<Banknote className="w-12 h-12 text-text-muted" />}
              title="No transactions for this date"
              description="No payments were collected on this date."
            />
          </div>
        )}
      </div>
    </div>
  );
}
