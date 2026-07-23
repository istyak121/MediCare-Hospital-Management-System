'use client';

import { useState } from 'react';
import { useTodayQueue, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Activity, Thermometer, Heart, Wind, Weight, Ruler, AlertTriangle } from 'lucide-react';

export default function NurseDashboard() {
  const { data, isLoading } = useTodayQueue();
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    pulseRate: '', respiratoryRate: '', spo2: '', weight: '', height: '',
  });

  const queue = data || ({} as any);
  const pendingVitals = (queue.checked_in || []).filter((a: any) => !a.vitalsRecorded);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedApt) return;
    setSaving(true);
    try {
      const bp = `${vitalsForm.bloodPressureSystolic}/${vitalsForm.bloodPressureDiastolic}`;
      await apiFetch(`/appointments/${selectedApt.id}/vitals`, {
        method: 'POST',
        body: JSON.stringify({
          temperature: vitalsForm.temperature ? parseFloat(vitalsForm.temperature) : null,
          bloodPressure: bp === '/' ? null : bp,
          pulseRate: vitalsForm.pulseRate ? parseInt(vitalsForm.pulseRate) : null,
          respiratoryRate: vitalsForm.respiratoryRate ? parseInt(vitalsForm.respiratoryRate) : null,
          spo2: vitalsForm.spo2 ? parseFloat(vitalsForm.spo2) : null,
          weight: vitalsForm.weight ? parseFloat(vitalsForm.weight) : null,
          height: vitalsForm.height ? parseFloat(vitalsForm.height) : null,
        }),
      });
      toast.success('Vitals recorded');
      setSelectedApt(null);
      setVitalsForm({ temperature: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', pulseRate: '', respiratoryRate: '', spo2: '', weight: '', height: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to record vitals');
    } finally {
      setSaving(false);
    }
  };

  const vitalsFields = [
    { key: 'temperature', label: 'Temperature (°C)', icon: Thermometer, range: '36-37.5', type: 'number', step: '0.1' },
    { key: 'bloodPressureSystolic', label: 'BP Systolic', icon: Heart, range: '90-120', type: 'number', colSpan: true },
    { key: 'bloodPressureDiastolic', label: 'BP Diastolic', icon: Heart, range: '60-80', type: 'number' },
    { key: 'pulseRate', label: 'Pulse Rate (bpm)', icon: Activity, range: '60-100', type: 'number' },
    { key: 'respiratoryRate', label: 'Resp. Rate (/min)', icon: Wind, range: '12-20', type: 'number' },
    { key: 'spo2', label: 'SpO2 (%)', icon: Wind, range: '95-100', type: 'number', step: '0.1' },
    { key: 'weight', label: 'Weight (kg)', icon: Weight, range: '', type: 'number', step: '0.1' },
    { key: 'height', label: 'Height (cm)', icon: Ruler, range: '', type: 'number', step: '0.1' },
  ];

  const updateVitalsField = (field: string, value: string) => {
    setVitalsForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Nurse Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vitals Queue */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Pending Vitals ({pendingVitals.length})</h2>
          {pendingVitals.length === 0 ? (
            <p className="text-sm text-text-muted py-8 text-center">No patients awaiting vitals</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pendingVitals.map((apt: any) => (
                <div key={apt.id}
                  onClick={() => setSelectedApt(apt)}
                  className={cn('p-3 rounded-md border cursor-pointer transition-colors', selectedApt?.id === apt.id ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-bg-secondary')}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{apt.patient?.fullName}</p>
                    <span className="text-xs text-amber-600">{apt.waitMinutes > 0 ? `${apt.waitMinutes} min` : 'Just now'}</span>
                  </div>
                  <p className="text-xs text-text-muted">{apt.doctor?.fullName} | {apt.timeSlot}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vitals Form */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">
            {selectedApt ? `Vitals: ${selectedApt.patient?.fullName}` : 'Record Vitals'}
          </h2>
          {!selectedApt ? (
            <p className="text-sm text-text-muted py-8 text-center">Select a patient from the queue</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {vitalsFields.map(field => (
                  <div key={field.key} className={cn(field.colSpan ? 'col-span-2 grid grid-cols-2 gap-3' : '')}>
                    {field.colSpan ? (
                      <>
                        {['Systolic', 'Diastolic'].map((pos, idx) => (
                          <div key={pos}>
                            <label className="flex items-center gap-1 text-xs font-medium text-text-secondary mb-1">
                              <field.icon className="w-3 h-3" /> BP {pos}
                            </label>
                            <input type={field.type} step={field.step}
                              value={idx === 0 ? vitalsForm.bloodPressureSystolic : vitalsForm.bloodPressureDiastolic}
                              onChange={e => updateVitalsField(idx === 0 ? 'bloodPressureSystolic' : 'bloodPressureDiastolic', e.target.value)}
                              className="w-full h-9 px-2 rounded-md border border-border bg-white text-sm" />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-text-secondary mb-1">
                          <field.icon className="w-3 h-3" /> {field.label}
                        </label>
                        <input type={field.type} step={field.step}
                          value={(vitalsForm as any)[field.key]}
                          onChange={e => updateVitalsField(field.key, e.target.value)}
                          className="w-full h-9 px-2 rounded-md border border-border bg-white text-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {alerts.length > 0 && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  {alerts.map((a, i) => (
                    <p key={i} className="flex items-center gap-1 text-xs text-red-700"><AlertTriangle className="w-3 h-3" /> {a.message}</p>
                  ))}
                </div>
              )}

              {vitalsForm.weight && vitalsForm.height && (
                <p className="text-xs text-text-muted">
                  BMI: {(parseFloat(vitalsForm.weight) / ((parseFloat(vitalsForm.height) / 100) ** 2)).toFixed(1)}
                </p>
              )}

              <button onClick={handleSave} disabled={saving}
                className="w-full h-10 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Vitals'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
