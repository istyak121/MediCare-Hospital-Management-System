'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePrescription } from '@/hooks/usePrescriptions';
import { ChevronLeft, FileText, User, Stethoscope, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: rx, isLoading } = usePrescription(id);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-md" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
  if (!rx) return <div className="text-center py-12 text-text-muted">Prescription not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/prescriptions')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{rx.prescriptionNo}</h1>
            <p className="text-sm text-text-muted">Created {formatDate(rx.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Patient</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-text-primary">{rx.patient?.fullName || 'Unknown'}</p>
            <p className="text-sm text-text-muted">{rx.patient?.patientId || ''}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-emerald-600" /></div>
            <h3 className="font-semibold text-text-primary">Doctor</h3>
          </div>
          <p className="text-lg font-medium text-text-primary">{rx.doctor?.fullName || 'Unknown'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Diagnosis & Complaint</h3>
        <div className="space-y-3">
          {rx.chiefComplaint && (
            <div>
              <label className="text-xs text-text-muted">Chief Complaint</label>
              <p className="text-sm font-medium text-text-primary">{rx.chiefComplaint}</p>
            </div>
          )}
          <div>
            <label className="text-xs text-text-muted">Diagnosis</label>
            <p className="text-sm font-medium text-text-primary">{rx.diagnosis}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Medicines</h3>
        {rx.medicines?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Medicine</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Dosage</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Duration</th>
                  <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Qty</th>
                  <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {rx.medicines.map((med: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-sm font-medium text-text-primary">{med.medicineName || med.medicine?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{med.dosage}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{med.duration || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-text-primary">{med.quantity}</td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{med.instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No medicines prescribed</p>
        )}
      </div>

      {rx.advice && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Advice</h3>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{rx.advice}</p>
        </div>
      )}

      {rx.followUpDate && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-sm text-text-muted">Follow-up Date</p>
              <p className="text-sm font-medium text-text-primary">{formatDate(rx.followUpDate)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}