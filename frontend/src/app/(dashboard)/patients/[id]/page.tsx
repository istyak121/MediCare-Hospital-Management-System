'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatient, usePatientRelations, usePatientHistory } from '@/hooks/usePatients';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { ChevronLeft, User, Heart, Calendar, BedDouble, FileText, FlaskConical, Receipt } from 'lucide-react';

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'medical', label: 'Medical History', icon: Heart },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'admissions', label: 'Admissions', icon: BedDouble },
  { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { key: 'lab-tests', label: 'Lab Reports', icon: FlaskConical },
  { key: 'invoices', label: 'Billing', icon: Receipt },
];

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('profile');

  const { data: patient, isLoading } = usePatient(id);
  const { data: history } = usePatientHistory(id);
  const { data: appointments } = usePatientRelations(id, 'appointments');
  const { data: admissions } = usePatientRelations(id, 'admissions');
  const { data: prescriptions } = usePatientRelations(id, 'prescriptions');
  const { data: labTests } = usePatientRelations(id, 'lab-tests');
  const { data: invoices } = usePatientRelations(id, 'invoices');

  if (isLoading) return <div className="text-center py-12 text-text-muted">Loading patient...</div>;
  if (!patient) return <div className="text-center py-12 text-text-muted">Patient not found</div>;

  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/patients')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{patient.fullName}</h1>
            <p className="text-sm text-text-muted">{patient.patientId} | {age}y | {patient.gender} | {patient.bloodGroup || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {history && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Appointments', value: history.summary?.totalAppointments || 0 },
            { label: 'Prescriptions', value: history.summary?.totalPrescriptions || 0 },
            { label: 'Lab Tests', value: history.summary?.totalLabTests || 0 },
            { label: 'Admissions', value: history.summary?.totalAdmissions || 0 },
            { label: 'Invoices', value: history.summary?.totalInvoices || 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-border p-4">
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border flex gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-muted hover:text-text-primary')}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-text-muted">Full Name (Bangla)</label><p className="text-sm font-medium">{patient.fullNameBn || 'N/A'}</p></div>
            <div><label className="text-xs text-text-muted">Phone</label><p className="text-sm font-medium">{patient.phone}</p></div>
            <div><label className="text-xs text-text-muted">Email</label><p className="text-sm font-medium">{patient.email || 'N/A'}</p></div>
            <div><label className="text-xs text-text-muted">Date of Birth</label><p className="text-sm font-medium">{formatDate(patient.dateOfBirth)}</p></div>
            <div><label className="text-xs text-text-muted">Blood Group</label><p className="text-sm font-medium">{patient.bloodGroup || 'N/A'}</p></div>
            <div><label className="text-xs text-text-muted">Gender</label><p className="text-sm font-medium capitalize">{patient.gender}</p></div>
            <div className="col-span-2"><label className="text-xs text-text-muted">Address</label><p className="text-sm font-medium">{patient.address || 'N/A'}</p></div>
            <div><label className="text-xs text-text-muted">Emergency Contact</label><p className="text-sm font-medium">{patient.emergencyContactName || 'N/A'}</p></div>
            <div><label className="text-xs text-text-muted">Emergency Phone</label><p className="text-sm font-medium">{patient.emergencyContactPhone || 'N/A'}</p></div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {patient.allergies?.length ? patient.allergies.map((a, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">{a}</span>) : <span className="text-sm text-text-muted">None recorded</span>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Chronic Diseases</h4>
              <div className="flex flex-wrap gap-2">
                {patient.chronicDiseases?.length ? patient.chronicDiseases.map((a, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{a}</span>) : <span className="text-sm text-text-muted">None recorded</span>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Current Medications</h4>
              <div className="flex flex-wrap gap-2">
                {patient.currentMedications?.length ? patient.currentMedications.map((a, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{a}</span>) : <span className="text-sm text-text-muted">None recorded</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-2">
            {!appointments?.length ? <p className="text-sm text-text-muted">No appointments recorded</p> : appointments.map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium">{apt.doctor?.fullName || 'Unknown doctor'}</p>
                  <p className="text-xs text-text-muted">{apt.chiefComplaint || 'No complaint'} | {apt.appointmentNo}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary">{apt.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'admissions' && (
          <div className="space-y-2">
            {!admissions?.length ? <p className="text-sm text-text-muted">No admissions recorded</p> : admissions.map((adm: any) => (
              <div key={adm.id} className="p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{adm.admissionNo} | {adm.bed?.bedNumber || 'N/A'}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary">{adm.status}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{formatDate(adm.admissionDate)} | {adm.diagnosis || 'No diagnosis'}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-2">
            {!prescriptions?.length ? <p className="text-sm text-text-muted">No prescriptions recorded</p> : prescriptions.map((rx: any) => (
              <div key={rx.id} className="p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{rx.prescriptionNo} | {rx.doctor?.fullName}</p>
                  <span className="text-xs text-text-muted">{formatDate(rx.createdAt)}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{rx.diagnosis}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lab-tests' && (
          <div className="space-y-2">
            {!labTests?.length ? <p className="text-sm text-text-muted">No lab tests recorded</p> : labTests.map((test: any) => (
              <div key={test.id} className="p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{test.testNo} | {test.testType?.name}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', test.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{test.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-2">
            {!invoices?.length ? <p className="text-sm text-text-muted">No invoices recorded</p> : invoices.map((inv: any) => (
              <div key={inv.id} className="p-3 rounded-md border border-border">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{inv.invoiceNo}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>{inv.status}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Total: {formatCurrency(inv.totalAmount)} | Due: {formatCurrency(inv.dueAmount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
