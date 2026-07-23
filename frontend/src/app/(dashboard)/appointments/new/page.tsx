'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartments } from '@/hooks/useDepartments';
import { useCreateAppointment, useAvailableSlots, useDoctorSchedule } from '@/hooks/useAppointments';
import { apiFetch } from '@/lib/api';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AppointmentType = 'opd' | 'follow_up' | 'emergency' | 'telemedicine';

export default function NewAppointmentPage() {
  const router = useRouter();
  const book = useCreateAppointment();

  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [apptType, setApptType] = useState<AppointmentType>('opd');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: depts } = useDepartments();
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(selectedDoctor?.id, selectedDate);
  const { data: docData } = useDoctorSchedule(selectedDoctor?.id);

  const slots = Array.isArray(slotsData) ? slotsData : (slotsData as any)?.data || [];
  const deptList = Array.isArray(depts) ? depts : (depts as any)?.data || [];
  const doctors = selectedDept
    ? (deptList.find((d: any) => d.id === selectedDept)?.staff || [])
        .filter((s: any) => s.specialization)
    : [];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (patientSearch.length >= 2) {
      apiFetch(`/patients?search=${encodeURIComponent(patientSearch)}&limit=10`)
        .then((d: any) => setPatients(d?.data || []))
        .catch(() => setPatients([]));
    }
  }, [patientSearch]);

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedSlot) return;
    setSaving(true);
    try {
      await book.mutateAsync({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        scheduleId: selectedDoctor.schedules?.[0]?.id || '',
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        type: apptType,
        chiefComplaint,
      });
      toast.success('Appointment booked successfully!');
      router.push('/appointments');
    } catch (err: any) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  const morningSlots = slots.filter((s: any) => s.label === 'Morning');
  const afternoonSlots = slots.filter((s: any) => s.label === 'Afternoon');
  const eveningSlots = slots.filter((s: any) => s.label === 'Evening');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Book Appointment</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {[{icon: User, label: 'Patient'}, {icon: Stethoscope, label: 'Doctor'}, {icon: Calendar, label: 'Date & Time'}, {icon: CheckCircle, label: 'Confirm'}].map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i + 1 <= step ? 'bg-primary-600 text-white' : 'bg-bg-tertiary text-text-muted'}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <span className={`text-sm hidden sm:inline ${i + 1 <= step ? 'font-medium text-text-primary' : 'text-text-muted'}`}>{s.label}</span>
            {i < 3 && <div className="w-6 h-0.5 bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        {/* Step 1: Select Patient */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Patient</h2>
            <input type="text" placeholder="Search by name, phone, or ID..." value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {patients.map((p: any) => (
                <div key={p.id}
                  onClick={() => { setSelectedPatient(p); setStep(2); }}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedPatient?.id === p.id ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-bg-secondary'}`}>
                  <p className="font-medium text-sm">{p.fullName}</p>
                  <p className="text-xs text-text-muted">{p.patientId} | {p.phone} | {p.gender}</p>
                </div>
              ))}
              {patients.length === 0 && patientSearch.length >= 2 && (
                <p className="text-sm text-text-muted text-center py-4">No patients found. <button className="text-primary-600 font-medium" onClick={() => router.push('/patients/new')}>Register new patient</button></p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Department & Doctor */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Department & Doctor</h2>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Department</label>
              <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedDoctor(null); }}
                className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm">
                <option value="">Select department</option>
                {deptList.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {selectedDept && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Doctor</label>
                <div className="space-y-2">
                  {doctors.map((doc: any) => (
                    <div key={doc.id}
                      onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-bg-secondary'}`}>
                      <p className="font-medium text-sm">{doc.fullName}</p>
                      <p className="text-xs text-text-muted">{doc.specialization} | Fee: ৳{doc.consultationFee}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Date & Time</h2>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={today}
              className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
            {selectedDate && slotsLoading && <p className="text-sm text-text-muted">Loading available slots...</p>}
            {selectedDate && !slotsLoading && slots.length === 0 && (
              <p className="text-sm text-amber-600">No available slots for this date.</p>
            )}
            {slots.length > 0 && (
              <div className="space-y-4">
                {[{label: 'Morning', items: morningSlots}, {label: 'Afternoon', items: afternoonSlots}, {label: 'Evening', items: eveningSlots}].map(group => group.items.length > 0 && (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-text-muted uppercase mb-2">{group.label}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {group.items.map((slot: any) => (
                        <button key={slot.time}
                          onClick={() => { setSelectedSlot(slot.time); setStep(4); }}
                          disabled={slot.available <= 0}
                          className={`p-2 rounded-md border text-xs text-center transition-colors ${
                            selectedSlot === slot.time ? 'border-primary-500 bg-primary-50 text-primary-700' :
                            slot.available > 0 ? 'border-border hover:border-primary-300 text-text-primary' :
                            'border-border bg-bg-secondary text-text-muted cursor-not-allowed'
                          }`}>
                          <p className="font-medium">{slot.time}</p>
                          <p className="text-xs mt-0.5">{slot.available > 0 ? `${slot.available} left` : 'Full'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Confirm Appointment</h2>
            <div className="bg-bg-secondary rounded-md p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-text-muted">Patient</span><span className="font-medium">{selectedPatient?.fullName} ({selectedPatient?.patientId})</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Doctor</span><span className="font-medium">{selectedDoctor?.fullName} - {selectedDoctor?.specialization}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Date & Time</span><span className="font-medium">{selectedDate} at {selectedSlot}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Consultation Fee</span><span className="font-medium">৳{selectedDoctor?.consultationFee}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Appointment Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'opd', label: 'OPD' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'telemedicine', label: 'Telemedicine' },
                ].map(t => (
                  <button key={t.value} onClick={() => setApptType(t.value as AppointmentType)}
                    className={`p-3 rounded-md border text-sm font-medium ${apptType === t.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border text-text-secondary'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Chief Complaint</label>
              <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 mt-4 border-t border-border">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-bg-tertiary">
            <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !selectedPatient) || (step === 2 && !selectedDoctor) || (step === 3 && !selectedSlot)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleBook} disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? 'Booking...' : 'Book Appointment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
