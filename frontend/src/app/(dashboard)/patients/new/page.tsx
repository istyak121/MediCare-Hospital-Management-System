'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePatient } from '@/hooks/usePatients';
import { ChevronLeft, ChevronRight, Save, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NewPatientPage() {
  const router = useRouter();
  const create = useCreatePatient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ fullName: '', fullNameBn: '', phone: '', email: '', dateOfBirth: '', gender: 'male', bloodGroup: '', address: '', emergencyContactName: '', emergencyContactPhone: '', allergies: [] as string[], chronicDiseases: [] as string[], currentMedications: [] as string[] });
  const [tagInput, setTagInput] = useState({ a: '', c: '', m: '' });

  const upd = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const addTag = (field: 'allergies' | 'chronicDiseases' | 'currentMedications', val: string) => {
    if (!val.trim()) return;
    upd(field, [...f[field], val.trim()]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await create.mutateAsync(f);
      toast.success('Patient registered successfully');
      router.push('/patients');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Register New Patient</h1>
      <div className="flex items-center gap-3 mb-4">
        {['Personal Info', 'Medical History'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= step ? 'bg-primary-600 text-white' : 'bg-bg-tertiary text-text-muted'}`}>{i + 1}</div>
            <span className={`text-sm ${i + 1 <= step ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{label}</span>
            {i === 0 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name *</label>
              <input value={f.fullName} onChange={e => upd('fullName', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-text-secondary mb-1">Name (Bangla)</label>
              <input value={f.fullNameBn} onChange={e => upd('fullNameBn', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Phone *</label>
              <input value={f.phone} onChange={e => upd('phone', e.target.value)} placeholder="01XXXXXXXXX" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input value={f.email} onChange={e => upd('email', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Date of Birth *</label>
              <input type="date" value={f.dateOfBirth} onChange={e => upd('dateOfBirth', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Gender *</label>
              <div className="flex gap-2">
                {['male', 'female', 'other'].map(g => (
                  <button key={g} onClick={() => upd('gender', g)} className={`flex-1 h-10 rounded-md border text-sm font-medium capitalize ${f.gender === g ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-border text-text-secondary hover:bg-bg-tertiary'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Blood Group</label>
              <select value={f.bloodGroup} onChange={e => upd('bloodGroup', e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm">
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <textarea value={f.address} onChange={e => upd('address', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Emergency Contact</label>
              <input value={f.emergencyContactName} onChange={e => upd('emergencyContactName', e.target.value)} placeholder="Name" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm mb-2" />
              <input value={f.emergencyContactPhone} onChange={e => upd('emergencyContactPhone', e.target.value)} placeholder="Phone" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" />
            </div>
            <div className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center text-text-muted">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Upload Photo</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {(['allergies', 'chronicDiseases', 'currentMedications'] as const).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-text-secondary mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {f[field]?.map((tag: string, i: number) => (
                    <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${field === 'allergies' ? 'bg-red-50 text-red-700' : field === 'chronicDiseases' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                      {tag} <button onClick={() => upd(field, f[field].filter((_: any, j: number) => j !== i))} className="hover:opacity-70">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={field === 'allergies' ? tagInput.a : field === 'chronicDiseases' ? tagInput.c : tagInput.m}
                    onChange={e => {
                      const key = field === 'allergies' ? 'a' : field === 'chronicDiseases' ? 'c' : 'm';
                      setTagInput(p => ({ ...p, [key]: e.target.value }));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag(field, (e.target as HTMLInputElement).value); setTagInput(p => ({ ...p, [field === 'allergies' ? 'a' : field === 'chronicDiseases' ? 'c' : 'm']: '' })); }
                    }}
                    placeholder={`Type and press Enter`}
                    className="flex-1 h-10 px-3 rounded-md border border-border bg-white text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border">
          <button onClick={() => step === 1 ? router.back() : setStep(1)} className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary">
            <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!f.fullName || !f.phone || !f.dateOfBirth} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Register Patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
