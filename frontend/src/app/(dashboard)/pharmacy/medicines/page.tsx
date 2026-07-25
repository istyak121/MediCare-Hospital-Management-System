'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMedicines } from '@/hooks/usePharmacy';
import { PillBottle, Plus, Search, ChevronLeft, ChevronRight, Filter, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

const CATEGORIES = ['tablet', 'capsule', 'injection', 'syrup', 'cream', 'inhaler', 'drop', 'other'];

export default function MedicineListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMedicines({ search: search || undefined, category: category || undefined, page, limit: 25 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Medicine Inventory</h1>
        <button onClick={() => router.push('/pharmacy/medicines/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> New Medicine
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search by name, generic, or brand..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Generic</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Strength</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Stock</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Selling Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={<PillBottle className="w-8 h-8 text-text-muted" />} title="No medicines found" description="Try adjusting your search or add a new medicine." />
                  </td>
                </tr>
              ) : (
                data.data.map((med: any) => (
                  <tr key={med.id} onClick={() => router.push('/pharmacy/medicines/' + med.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{med.name}</span>
                        {med.stockQuantity <= med.reorderLevel && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" aria-label="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{med.genericName || '-'}</td>
                    <td className="px-4 py-3 text-sm"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{med.category}</span></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{med.strength || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn('font-medium', med.stockQuantity <= med.reorderLevel ? 'text-red-600' : 'text-text-primary')}>
                        {med.stockQuantity} {med.unit || ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-text-primary">{formatCurrency(med.sellingPrice)}</td>
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
            <span className="text-sm text-text-muted">Showing {(data.page - 1) * data.limit + 1}-{Math.min(data.page * data.limit, data.total)} of {data.total}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium px-2">{data.page} / {data.totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= data.totalPages} className="h-8 px-3 rounded-md border border-border bg-white text-sm disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
