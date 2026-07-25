'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMedicine, useAdjustStock } from '@/hooks/usePharmacy';
import { ChevronLeft, PillBottle, Package, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: med, isLoading } = useMedicine(id);
  const adjustStock = useAdjustStock(id);
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState('');

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-md" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
  if (!med) return <div className="text-center py-12 text-text-muted">Medicine not found</div>;

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjQty === 0) return toast.error('Enter a quantity to adjust');
    try {
      await adjustStock.mutateAsync({ quantity: adjQty, reason: adjReason || undefined });
      toast.success(`Stock adjusted by ${adjQty > 0 ? '+' : ''}${adjQty}`);
      setAdjQty(0);
      setAdjReason('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/pharmacy/medicines')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <PillBottle className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{med.name}</h1>
            <p className="text-sm text-text-muted">{med.genericName || med.brandName || med.category}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Stock Quantity</p>
          <p className={cn('text-2xl font-bold', med.stockQuantity <= med.reorderLevel ? 'text-red-600' : 'text-text-primary')}>
            {med.stockQuantity} {med.unit || ''}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Reorder Level</p>
          <p className="text-2xl font-bold text-text-primary">{med.reorderLevel}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Selling Price</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(med.sellingPrice)}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Unit Price</p>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(med.unitPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Medicine Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-text-muted">Name</label><p className="text-sm font-medium">{med.name}</p></div>
            <div><label className="text-xs text-text-muted">Generic Name</label><p className="text-sm font-medium">{med.genericName || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Brand Name</label><p className="text-sm font-medium">{med.brandName || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Category</label><p className="text-sm font-medium">{med.category}</p></div>
            <div><label className="text-xs text-text-muted">Strength</label><p className="text-sm font-medium">{med.strength || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Unit</label><p className="text-sm font-medium">{med.unit || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Supplier</label><p className="text-sm font-medium">{med.supplier || '-'}</p></div>
            <div><label className="text-xs text-text-muted">Created</label><p className="text-sm font-medium">{formatDate(med.createdAt)}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Adjust Stock</h3>
          <form onSubmit={handleAdjustStock} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Quantity *</label>
              <input type="number" value={adjQty} onChange={e => setAdjQty(Number(e.target.value))} placeholder="Positive to add, negative to remove" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
              <p className="text-xs text-text-muted mt-1">Use positive value to add stock, negative to remove</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <input type="text" value={adjReason} onChange={e => setAdjReason(e.target.value)} placeholder="e.g. New shipment, damaged, expired" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <button type="submit" disabled={adjustStock.isPending} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {adjustStock.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Package className="w-4 h-4" /> Update Stock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}