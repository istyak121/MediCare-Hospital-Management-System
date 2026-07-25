'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBedAvailability, useWards } from '@/hooks/useAdmissions';
import { BedDouble, Plus, Search, ChevronLeft, ChevronRight, Filter, Home, Building2, UserCheck, Layout } from 'lucide-react';
import { toast } from 'sonner';

export default function BedManagementPage() {
  const router = useRouter();
  const { data: wards } = useWards();
  const [selectedWard, setSelectedWard] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: bedData, isLoading } = useBedAvailability(selectedWard || undefined);

  // Filter beds based on search
  const allBeds = bedData || [];
  const filteredBeds = allBeds.filter((bed: any) =>
    search ? bed.bedNumber?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const occupiedCount = allBeds.filter((b: any) => b.isOccupied).length;
  const totalCount = allBeds.length;
  const availableCount = totalCount - occupiedCount;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <BedDouble className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Bed Management</h1>
            <p className="text-sm text-text-muted">Visual bed availability board. Manage ward allocations and bed status.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BedDouble className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">{totalCount}</p>
              <p className="text-sm text-text-muted">Total Beds</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{availableCount}</p>
              <p className="text-sm text-text-muted">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Home className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{occupiedCount}</p>
              <p className="text-sm text-text-muted">Occupied</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Selector & Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedWard}
          onChange={e => { setSelectedWard(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-md border border-border bg-white text-sm"
        >
          <option value="">All Wards</option>
          {wards?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by bed number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Bed Grid */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-white rounded animate-pulse" />
                  <div className="h-4 w-10 bg-white rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-white rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Layout className="w-12 h-12 mb-3" />
            <p className="text-sm">No beds found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredBeds.map((bed: any) => (
              <div
                key={bed.id}
                className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  bed.isOccupied ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-text-primary">{bed.bedNumber}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                    bed.isOccupied ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {bed.isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Home className="w-3.5 h-3.5" />
                    <span>{bed.ward?.name || 'No ward'}</span>
                  </div>
                  {bed.isOccupied && bed.patient && (
                    <div className="flex items-center gap-1 text-text-secondary">
                      <Layout className="w-3.5 h-3.5" />
                      <span className="truncate">{bed.patient.fullName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
