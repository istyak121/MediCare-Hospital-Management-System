'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaff } from '@/hooks/useStaff';
import { UserCog, Plus, Search, ChevronLeft, ChevronRight, Filter, Building2, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StaffPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStaff({ search: search || undefined, departmentId: department || undefined });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Staff Directory</h1>
        <button onClick={() => router.push('/staff/new')} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, employee ID, or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All Departments</option>
          <option value="1">Cardiology</option>
          <option value="2">Neurology</option>
          <option value="3">Orthopedics</option>
          <option value="4">Pediatrics</option>
          <option value="5">Emergency</option>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Status</th>
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
                    <EmptyState
                      icon={<UserCheck className="w-8 h-8 text-text-muted" />}
                      title="No staff found"
                      description="Try adjusting your search or add a new staff member."
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((staff: any) => (
                  <tr key={staff.id} onClick={() => router.push('/staff/' + staff.id)} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{staff.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">{staff.fullName}</div>
                      {staff.fullNameBn && <div className="text-xs text-text-muted">{staff.fullNameBn}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{staff.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{staff.designation || '-'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{staff.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
