'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useCreatePrescription, useSearchMedicines } from '@/hooks/usePrescriptions';
import { useAuthStore } from '@/stores/authStore';
import { ChevronLeft, Save, Loader2, Plus, X, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function WritePrescriptionPage() {
  const router = useRouter();
  const create = useCreatePrescription();
  const user = useAuthStore((s: any) => s.user);

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiFetch('/patients?limit=1000'),
  });
  const patients = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || [];

  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const { data: searchResults } = useSearchMedicines(medSearch);

  const filteredPatients = patients.filter((p: any) =>
    patientSearch ? p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) || p.patientId?.includes(patientSearch) || p.phone?.includes(patientSearch) : true
  );

  const addMedicine = (med: any) => {
    setMedicines([...medicines, {
      medicineId: med.id,
      medicineName: med.name,
      dosage: med.strength || 'As directed',
      duration: '',
      instructions: '',
      quantity: 1,
    }]);
    setMedSearch('');
  };

  const updateMedicine = (index: number, field: string, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return toast.error('Select a patient');
    if (!diagnosis.trim()) return toast.error('Enter a diagnosis');
    if (medicines.length === 0) return toast.error('Add at least one medicine');

    const payload = {
      patientId,
      doctorId: user?.staffId || null,
      diagnosis: diagnosis.trim(),
      chiefComplaint: chiefComplaint.trim() || undefined,
      advice: advice.trim() || undefined,
      followUpDate: followUpDate || undefined,
      medicines: medicines.map(m => ({
        medicineId: m.medicineId,
        medicineName: m.medicineName,
        dosage: m.dosage,
        duration: m.duration,
        instructions: m.instructions || undefined,
        quantity: m.quantity,
      })),
    };

    try {
      await create.mutateAsync(payload);
      toast.success('Prescription created');
      router.push('/prescriptions');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create prescription');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Prescription</h1>
            <p className="text-sm text-text-muted">Write a prescription for a patient</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Patient *</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }} onFocus={() => setShowPatientDropdown(true)} placeholder="Search patient by name, ID, or phone..." className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
            {showPatientDropdown && patientSearch && (
              <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border border-border rounded-md bg-white divide-y divide-border shadow-lg">
                {filteredPatients.length === 0 ? <p className="text-sm text-text-muted p-3">No patients found</p> : filteredPatients.slice(0, 10).map((patient: any) => (
                  <button key={patient.id} type="button" onClick={() => { setPatientId(patient.id); setPatientSearch(patient.fullName); setShowPatientDropdown(false); }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-bg-secondary text-left">
                    <div><span className="font-medium text-text-primary">{patient.fullName}</span><span className="text-text-muted ml-2">{patient.patientId || patient.phone}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {patientId && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-md">
              <span className="text-sm font-medium text-primary-700">{patientSearch}</span>
              <button type="button" onClick={() => { setPatientId(''); setPatientSearch(''); }} className="text-primary-600 hover:text-primary-700"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Doctor</label>
          <input type="text" value={user?.fullName || user?.email || ''} disabled className="w-full h-10 px-3 rounded-md border border-border bg-bg-secondary text-sm text-text-muted" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Chief Complaint</label>
            <input type="text" value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="Patient's main complaint..." className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Diagnosis *</label>
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} placeholder="Enter diagnosis..." className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Medicines *</label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={medSearch} onChange={e => setMedSearch(e.target.value)} placeholder="Search medicines to prescribe..." className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          {medSearch.length >= 2 && searchResults && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border mb-3">
              {searchResults.map((med: any) => (
                <button key={med.id} type="button" onClick={() => addMedicine(med)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-bg-secondary text-left">
                  <div><span className="font-medium text-text-primary">{med.name}</span><span className="text-text-muted ml-2">{med.genericName}</span></div>
                  <Plus className="w-4 h-4 text-primary-600" />
                </button>
              ))}
            </div>
          )}

          {medicines.length > 0 && (
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="border border-border rounded-md p-3 bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{med.medicineName}</span>
                    <button type="button" onClick={() => removeMedicine(i)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs text-text-muted mb-0.5">Dosage</label>
                      <input type="text" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="500mg" className="w-full h-8 px-2 rounded border border-border bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-0.5">Duration</label>
                      <input type="text" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} placeholder="7 days" className="w-full h-8 px-2 rounded border border-border bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-0.5">Qty</label>
                      <input type="number" min="1" value={med.quantity} onChange={e => updateMedicine(i, 'quantity', Number(e.target.value))} className="w-full h-8 px-2 rounded border border-border bg-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-0.5">Instructions</label>
                      <input type="text" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} placeholder="After meals" className="w-full h-8 px-2 rounded border border-border bg-white text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Advice</label>
            <textarea value={advice} onChange={e => setAdvice(e.target.value)} rows={2} placeholder="Additional advice for the patient..." className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Follow-up Date</label>
            <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={() => router.back()} className="h-10 px-6 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary">Cancel</button>
          <button type="submit" disabled={create.isPending} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Create Prescription
          </button>
        </div>
      </form>
    </div>
  );
}
