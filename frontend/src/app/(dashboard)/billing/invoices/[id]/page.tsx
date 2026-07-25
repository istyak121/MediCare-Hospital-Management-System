'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useInvoice, useAddPayment } from '@/hooks/useBilling';
import { ChevronLeft, Printer, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default function InvoiceDetailPage() {
  const t = useTranslations('billing');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: inv, isLoading } = useInvoice(id);
  const addPayment = useAddPayment();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', transactionId: '', notes: '' });

  if (isLoading) return <div className="text-center py-12 text-text-muted">Loading...</div>;
  if (!inv) return <div className="text-center py-12 text-text-muted">Invoice not found</div>;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPayment.mutateAsync({ id: inv.id, data: { amount: Number(paymentForm.amount), paymentMethod: paymentForm.paymentMethod, transactionId: paymentForm.transactionId, notes: paymentForm.notes } });
      toast.success('Payment added');
      setShowPayment(false);
      setPaymentForm({ amount: '', paymentMethod: 'CASH', transactionId: '', notes: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add payment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-bg-tertiary"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">Invoice #{inv.invoiceNo}</h1>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"><Printer className="w-4 h-4" /> Print</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Status</p>
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border">{inv.status?.replace('_', ' ')}</span>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Patient</p>
          <p className="font-medium">{inv.patient?.fullName || '-'}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Invoice Date</p>
          <p className="font-medium">{formatDate(inv.createdAt)}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Due Date</p>
          <p className="font-medium">{formatDate(inv.dueDate) || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-secondary rounded-lg p-4 text-center">
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(inv.totalAmount)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <p className="text-xs text-emerald-700">Paid</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(inv.paidAmount)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-xs text-red-700">Due</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(inv.dueAmount)}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-700">Payment %</p>
            <p className="text-2xl font-bold text-blue-700">{inv.totalAmount > 0 ? Math.round((inv.paidAmount / inv.totalAmount) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Type</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Total</th>
              </tr>
            </thead>
            <tbody>
              {inv.items?.map((item: any) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="px-4 py-3 text-sm text-text-primary">{item.description}</td>
                  <td className="px-4 py-3 text-sm"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border">{item.itemType}</span></td>
                  <td className="px-4 py-3 text-right text-sm text-text-secondary">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-sm text-text-primary">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inv.payments?.length > 0 && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Method</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(p.receivedAt)}</td>
                    <td className="px-4 py-3 text-sm"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">{p.paymentMethod}</span></td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-emerald-700">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inv.dueAmount > 0 && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
        <div className="flex justify-end">
          <button onClick={() => setShowPayment(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
            <CreditCard className="w-4 h-4" /> Add Payment
          </button>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Amount *</label>
                <input type="number" step="0.01" min="0.01" max={inv.dueAmount} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" required />
                <p className="text-xs text-text-muted mt-1">Due: {formatCurrency(inv.dueAmount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Method *</label>
                <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Transaction ID</label>
                <input type="text" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} rows={2} className="w-full px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPayment(false)} className="flex-1 h-10 px-4 rounded-md border border-border bg-white text-sm hover:bg-bg-tertiary">Cancel</button>
                <button type="submit" disabled={addPayment.isPending} className="flex-1 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{addPayment.isPending ? 'Saving...' : 'Add Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
