'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLowStock, useMedicines } from '@/hooks/usePharmacy';
import { PillBottle, AlertTriangle, Plus, Package, DollarSign, TrendingDown, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function PharmacyPage() {
  const router = useRouter();
  const { data: lowStock, isLoading: loadingLow } = useLowStock();
  const { data: allMeds, isLoading } = useMedicines({ limit: 1 });

  const totalMeds = allMeds?.total || 0;
  const lowStockCount = lowStock?.length || 0;
  const totalValue = 0; // Would need a separate API for total inventory value

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <PillBottle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pharmacy</h1>
            <p className="text-sm text-text-muted">Medicine inventory, dispensing & stock management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/pharmacy/medicines/new')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" /> New Medicine
          </button>
          <button
            onClick={() => router.push('/pharmacy/dispense')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary"
          >
            <Package className="w-4 h-4" /> Dispense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <PillBottle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{isLoading ? '...' : totalMeds}</p>
              <p className="text-sm text-text-muted">Total Medicines</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{loadingLow ? '...' : lowStockCount}</p>
              <p className="text-sm text-text-muted">Low Stock Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(0)}</p>
              <p className="text-sm text-text-muted">Today&apos;s Sales</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(0)}</p>
              <p className="text-sm text-text-muted">Monthly Reorder Cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Low Stock Alerts</h3>
          <button onClick={() => router.push('/pharmacy/medicines')} className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {loadingLow ? (
          <TableSkeleton rows={3} cols={4} />
        ) : !lowStock || lowStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <Package className="w-10 h-10 mb-2" />
            <p className="text-sm">All medicines are adequately stocked</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Medicine</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Category</th>
                  <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Stock</th>
                  <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Reorder Level</th>
                  <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 5).map((med: any) => (
                  <tr key={med.id} onClick={() => router.push(`/pharmacy/medicines/${med.id}`)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-2.5 text-sm font-medium text-text-primary">{med.name}</td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{med.category}</td>
                    <td className="px-4 py-2.5 text-sm text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        {med.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-text-muted">{med.reorderLevel}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Restock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => router.push('/pharmacy/medicines')} className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <PillBottle className="w-5 h-5 text-blue-600" />          </div>
          <h4 className="font-semibold text-text-primary mb-1">Medicine Inventory</h4>
          <p className="text-sm text-text-muted">Browse, search, and manage all medicines</p>
        </button>
        <button onClick={() => router.push('/pharmacy/dispense')} className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-text-primary mb-1">Dispense Medicines</h4>
          <p className="text-sm text-text-muted">Process prescriptions and dispense to patients</p>
        </button>
        <button onClick={() => router.push('/pharmacy/medicines/new')} className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="font-semibold text-text-primary mb-1">Add New Medicine</h4>
          <p className="text-sm text-text-muted">Register a new medicine to inventory</p>
        </button>
      </div>
    </div>
  );
}
     
