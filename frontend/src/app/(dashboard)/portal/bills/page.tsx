'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt } from 'lucide-react';

export default function PortalBills() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'invoices'],
    queryFn: () => apiFetch('/invoices'),
  });
  const invoices = Array.isArray(data) ? data : (data as any)?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">My Bills</h1>
      {isLoading ? <p className="text-text-muted">Loading...</p> : invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <Receipt className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{inv.invoiceNo}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{inv.status}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-muted">{formatDate(inv.createdAt)}</span>
                <span className="text-sm font-medium">{formatCurrency(inv.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
