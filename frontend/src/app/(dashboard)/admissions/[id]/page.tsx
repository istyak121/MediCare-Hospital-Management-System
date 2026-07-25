'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmission, useDischarge, useTransferBed, useAddProgressNote } from '@/hooks/useAdmissions';
import { apiFetch } from '@/lib/api';
import { ChevronLeft, Home, UserPlus, BedDouble, ArrowRight, FileText, Loader2, AlertTriangle, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  discharged: 'bg-blue-50 text-blue-700 border-blue-200',
  transferred: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusLabels = {
  active: 'Active',
  discharged: 'Discharged',
  transferred: 'Transferred',
};

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: adm, isLoading } = useAdmission(id);
  const discharge = useDischarge(id);
  const transfer = useTransferBed(id);
  const addNote = useAddProgressNote(id);
  const [newNote, setNewNote] = useState('');
  const [beds, setBeds] = useState<any[]>([]);
  const [showTransfer, setShowTransfer] = useState(false);

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
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    </div>
  );
  if (!adm) return <div className="text-center py-12 text-text-muted">Admission not found</div>;

  const handleTransfer = async () => {
    const newBedId = prompt('Enter new bed ID:');
    if (!newBedId) return;
    try {
      await transfer.mutateAsync({ newBedId });
      toast.success('Patient transferred');
      setShowTransfer(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to transfer');
    }
  };

  const handleDischarge = async () => {
    const notes = prompt('Discharge notes (optional):');
    if (notes === null) return;
    try {
      await discharge.mutateAsync({ dischargeNotes: notes });
      toast.success('Patient discharged');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to discharge');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote.mutateAsync({ note: newNote });
      toast.success('Progress note added');
      setNewNote('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add note');
    }
  };

  const loadBeds = async () => {
    if (adm.bed?.ward?.id) {
      const response = await apiFetch('/admissions/bed-availability?wardId=' + adm.bed.ward.id);
      setBeds(response.filter((b: any) => !b.isOccupied));
    }
  };

  if (adm.bed?.ward?.id && beds.length === 0) loadBeds();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admissions')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <BedDouble className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{adm.admissionNo}</h1>
            <p className="text-sm text-text-muted">
              {adm.patient?.fullName || 'Unknown'} | {adm.bed?.bedNumber} / {adm.bed?.ward?.name || 'No ward'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Patient</p>
          <p className="text-sm font-medium">{adm.patient?.fullName || '-'}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Doctor</p>
          <p className="text-sm font-medium">{adm.doctor?.fullName || '-'}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Admission Type</p>
          <p className="text-sm font-medium capitalize">{adm.admissionType}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-muted">Status</p>
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border {statusColors[adm.status] || 'bg-bg-tertiary text-text-muted border-border'}">
            {statusLabels[adm.status as keyof typeof statusLabels] || adm.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Admission Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Admission #</label>
              <p className="text-sm font-medium">{adm.admissionNo}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">Admitted</label>
              <p className="text-sm font-medium">{formatDate(adm.admissionDate)}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">Bed</label>
              <p className="text-sm font-medium">{adm.bed?.bedNumber || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">Ward</label>
              <p className="text-sm font-medium">{adm.bed?.ward?.name || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-muted">Discharged</label>
              <p className="text-sm font-medium">{adm.dischargeDate ? formatDate(adm.dischargeDate) : 'Not discharged'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-muted">Diagnosis</label>
              <p className="text-sm font-medium">{adm.diagnosis || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-text-muted">Symptoms</label>
              <p className="text-sm font-medium">{adm.symptoms || '-'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {adm.status === 'active' && (
            <div className="bg-white rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary">Actions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowTransfer(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary">
                  <ArrowRight className="w-3.5 h-3.5" /> Transfer
                </button>
                <button onClick={handleDischarge} disabled={discharge.isPending} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  {discharge.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Home className="w-3.5 h-3.5" /> Discharge
                </button>
              </div>
            </div>
          )}

          {showTransfer && (
            <div className="bg-white rounded-lg border border-border shadow-sm p-4">
              <h4 className="font-semibold text-text-primary mb-3">Transfer to New Bed</h4>
              <select value={''} onChange={e => { setBeds([...beds, { id: e.target.value, bedNumber: e.target.value }]); }} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm mb-3">
                <option value="">Select available bed</option>
                {beds.map((b: any) => <option key={b.id} value={b.id}>{b.bedNumber} - {b.ward?.name || 'No ward'}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTransfer(false)} className="h-9 px-4 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary">Cancel</button>
                <button onClick={handleTransfer} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">Confirm Transfer</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Progress Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Add Progress Note</label>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} placeholder="Enter progress note..." className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
              </div>
              <button type="submit" disabled={addNote.isPending} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                {addNote.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <FileText className="w-3.5 h-3.5" /> Add Note
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {adm.progressNotes && adm.progressNotes.length > 0 ? (
                adm.progressNotes.map((note: any, i: number) => (
                  <div key={i} className="p-3 bg-bg-secondary rounded-md border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">{note.authorName || 'Staff'}</span>
                      <span className="text-xs text-text-muted">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No progress notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}