'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestLabTest, useTestTypes } from '@/hooks/useLabTests';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { ChevronLeft, Save, Loader2, FlaskConical, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function NewLabTestPage() {
  const router = useRouter();
  const create = useRequestLabTest();
  const { data: testTypes, isLoading: loadingTypes } = useTestTypes();
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'search'],
    queryFn: () => apiFetch('/patients?limit=1000'),
  });
  const patients = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || [];

  const [patientId, setPatientId] = useState('');
  const [testTypeId, setTestTypeId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const filteredPatients = patients.filter((p: any) =>
    patientSearch ? p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) || p.patientId?.includes(patientSearch) || p.phone?.includes(patientSearch) : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return toast.error('Select a patient');
    if (!testTypeId) return toast.error('Select a test type');

    try {
      await create.mutateAsync({ patientId, testTypeId });
      toast.success('Lab test requested successfully');
      router.push('/lab/tests');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create lab test request');
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
            <FlaskConical className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Lab Test Request</h1>
            <p className="text-sm text-text-muted">Create a lab test order for a patient</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Patient *</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={patientSearch}
              onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Search patient by name, ID, or phone..."
              className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
            />
            {showPatientDropdown && patientSearch && (
              <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border border-border rounded-md bg-white divide-y divide-border shadow-lg">
                {filteredPatients.length === 0 ? (
                  <p className="text-sm text-text-muted p-3">No patients found</p>
                ) : (
                  filteredPatients.slice(0, 10).map((patient: any) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => { setPatientId(patient.id); setPatientSearch(patient.fullName); setShowPatientDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-bg-secondary text-left"
                    >
                      <div>
                        <span className="font-medium text-text-primary">{patient.fullName}</span>
                        <span className="text-text-muted ml-2">{patient.patientId || patient.phone}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {patientId && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-md">
              <span className="text-sm font-medium text-primary-700">{patientSearch}</span>
              <button type="button" onClick={() => { setPatientId(''); setPatientSearch(''); }} className="text-primary-600 hover:text-primary-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Test Type *</label>
          <select
            value={testTypeId}
            onChange={e => setTestTypeId(e.target.value)}
            disabled={loadingTypes}
            className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="">Select test type</option>
            {testTypes?.map((type: any) => (
              <option key={type.id} value={type.id}>
                {type.name} {type.category ? '(' + type.category + ')' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={() => router.back()} className="h-10 px-6 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary">Cancel</button>
          <button type="submit" disabled={create.isPending} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Request Test
          </button>
        </div>
      </form>
    </div>
  );
}