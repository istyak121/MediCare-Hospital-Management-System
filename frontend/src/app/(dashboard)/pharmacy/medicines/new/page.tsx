'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMedicine } from '@/hooks/usePharmacy';
import { ChevronLeft, Save, Loader2, PillBottle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['tablet', 'capsule', 'injection', 'syrup', 'cream', 'inhaler', 'drop', 'other'];

export default function NewMedicinePage() {
  const router = useRouter();
  const create = useCreateMedicine();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    name: '',
    genericName: '',
    brandName: '',
    category: 'tablet',
    strength: '',
    unit: '',
    unitPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    supplier: '',
  });

  const upd = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return toast.error('Medicine name is required');
    setSaving(true);
    try {
      await create.mutateAsync(f);
      toast.success('Medicine added successfully');
      router.push('/pharmacy/medicines');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <PillBottle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Medicine</h1>
            <p className="text-sm text-text-muted">Add a new medicine to inventory</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Medicine Name *</label>
            <input value={f.name} onChange={e => upd('name', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Generic Name</label>
            <input value={f.genericName} onChange={e => upd('genericName', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Brand Name</label>
            <input value={f.brandName} onChange={e => upd('brandName', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category *</label>
            <select value={f.category} onChange={e => upd('category', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Strength</label>
            <input value={f.strength} onChange={e => upd('strength', e.target.value)} placeholder="e.g. 500mg" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
            <input value={f.unit} onChange={e => upd('unit', e.target.value)} placeholder="e.g. tablet, ml" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Unit Price (BDT)</label>
            <input type="number" min="0" step="0.01" value={f.unitPrice} onChange={e => upd('unitPrice', Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Selling Price (BDT)</label>
            <input type="number" min="0" step="0.01" value={f.sellingPrice} onChange={e => upd('sellingPrice', Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Initial Stock</label>
            <input type="number" min="0" value={f.stockQuantity} onChange={e => upd('stockQuantity', Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Reorder Level</label>
            <input type="number" min="0" value={f.reorderLevel} onChange={e => upd('reorderLevel', Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Supplier</label>
            <input value={f.supplier} onChange={e => upd('supplier', e.target.value)} placeholder="Supplier name" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={() => router.back()} className="h-10 px-6 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary">Cancel</button>
          <button type="submit" disabled={saving || create.isPending} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {(saving || create.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
}