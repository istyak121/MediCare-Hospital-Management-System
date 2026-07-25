'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useInvoices } from '@/hooks/useBilling';
import { Plus, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

export default function BillingPage() {
  const t = useTranslations('billing');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useInvoices({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    page,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('invoices')}</h1>
        <button
          onClick={() => router.push('/billing/invoices/new')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> {t('new_invoice')}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by invoice #, patient name, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIAL_PAID">Partial Paid</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All Types</option>
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
          <option value="PHARMACY">Pharmacy</option>
          <option value="LAB">Lab</option>
        </select>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Filter className="w-4 h-4" />
        </button>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Invoice #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Paid</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Due</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-muted">
                    <div className="flex justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-muted">No invoices found</td>
                </tr>
              ) : (
                data.data.map((inv: any) => (
                  <tr key={inv.id} onClick={() => router.push(`/billing/invoices/${inv.id}`)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{inv.invoiceNo}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">{inv.patient?.fullName || '-'}</div>
                      <div className="text-xs text-text-muted">{inv.patient?.patientId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border">
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-danger">{formatCurrency(inv.dueAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border">
                        {inv.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-secondary">
            <span className="text-sm text-text-muted">
              Showing {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-2">{data.page} / {data.totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
                className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
