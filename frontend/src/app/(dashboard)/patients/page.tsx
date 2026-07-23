'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePatients } from '@/hooks/usePatients';
import { Search, Plus, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function PatientsPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState('');
  const [gender, setGender] = useState('');

  const { data, isLoading } = usePatients({ search, page, limit: 25, gender: gender || undefined, dateRange: dateRange || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Patients</h1>
        <button
          onClick={() => router.push('/patients/new')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          New Patient
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-10 px-3 rounded-md border border-border bg-white text-sm">
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Filter className="w-4 h-4" />
        </button>
        <button className="h-10 px-3 rounded-md border border-border bg-white text-text-secondary hover:bg-bg-tertiary">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Patient ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Age/Gender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Last Visit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-muted">Loading...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-muted">No patients found</td></tr>
              ) : (
                data?.data?.map((patient: any) => {
                  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000);
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="border-b border-border last:border-0 hover:bg-bg-secondary/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-text-muted">{patient.patientId}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-text-primary">{patient.fullName}</div>
                        {patient.fullNameBn && <div className="text-xs text-text-muted">{patient.fullNameBn}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{age}y / {patient.gender}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{patient.phone}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{patient.createdAt ? formatDate(patient.createdAt) : '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
