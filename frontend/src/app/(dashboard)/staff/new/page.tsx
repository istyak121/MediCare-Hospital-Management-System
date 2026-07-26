'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserPlus, ArrowRight, Save, X, ChevronDown, ChevronUp, Calendar, Phone, Mail, MapPin, Briefcase, GraduationCap, CalendarDays, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useDepartments } from '@/hooks/useDepartments';

type StaffFormData = {
  user: {
    email: string;
    password: string;
    fullName: string;
    fullNameBn?: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    address?: string;
    dateOfBirth?: string;
  };
  employeeId: string;
  designation: string;
  specialization?: string;
  qualifications: string[];
  experienceYears?: number;
  consultationFee?: number;
  departmentId: string;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', labelBn: 'রবিবার' },
  { value: 1, label: 'Monday', labelBn: 'সোমবার' },
  { value: 2, label: 'Tuesday', labelBn: 'মঙ্গলবার' },
  { value: 3, label: 'Wednesday', labelBn: 'বুধবার' },
  { value: 4, label: 'Thursday', labelBn: 'বৃহস্পতিবার' },
  { value: 5, label: 'Friday', labelBn: 'শুক্রবার' },
  { value: 6, label: 'Saturday', labelBn: 'শনিবার' },
];

const INITIAL_FORM_DATA: StaffFormData = {
  user: {
    email: '',
    password: '',
    fullName: '',
    fullNameBn: '',
    phone: '',
    gender: 'male',
    address: '',
    dateOfBirth: '',
  },
  employeeId: '',
  designation: '',
  specialization: '',
  qualifications: [''],
  experienceYears: undefined,
  consultationFee: undefined,
  departmentId: '',
  schedules: DAYS_OF_WEEK.map(day => ({
    dayOfWeek: day.value,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: day.value !== 0 && day.value !== 6,
  })),
};

export default function AddStaffMemberPage() {
  const t = useTranslations('common');
  const tStaff = useTranslations('staff');
  const router = useRouter();
  const [formData, setFormData] = useState<StaffFormData>(INITIAL_FORM_DATA);
  const [qualificationInputs, setQualificationInputs] = useState<string[]>(['']);
  const [expandedDays, setExpandedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { data: departments } = useDepartments();

  const createStaffMutation = useMutation({
    mutationFn: (data: StaffFormData) => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success(tStaff('staffCreatedSuccess'));
      router.push('/staff');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || tStaff('staffCreateError'));
    },
  });

  const handleQualificationChange = (index: number, value: string) => {
    const newQualifications = [...qualificationInputs];
    newQualifications[index] = value;
    setQualificationInputs(newQualifications);
    setFormData(prev => ({ ...prev, qualifications: newQualifications.filter(q => q.trim()) }));
  };

  const addQualification = () => {
    setQualificationInputs(prev => [...prev, '']);
  };

  const removeQualification = (index: number) => {
    if (qualificationInputs.length <= 1) return;
    const newQualifications = qualificationInputs.filter((_, i) => i !== index);
    setQualificationInputs(newQualifications);
    setFormData(prev => ({ ...prev, qualifications: newQualifications.filter(q => q.trim()) }));
  };

  const toggleDayExpanded = (day: number) => {
    setExpandedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleScheduleChange = (day: number, field: 'startTime' | 'endTime' | 'isAvailable', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s),
    }));
  };

  const handleInputChange = (field: keyof StaffFormData['user'], value: string) => {
    setFormData(prev => ({ ...prev, user: { ...prev.user, [field]: value } }));
  };

  const handleStaffFieldChange = (field: keyof Omit<StaffFormData, 'user' | 'qualifications' | 'schedules'>, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      qualifications: qualificationInputs.filter(q => q.trim()),
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
    };
    createStaffMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{tStaff('addStaffMember')}</h1>
            <p className="text-sm text-text-muted">{tStaff('createStaffProfile')}</p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="btn-ghost gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-600" />
              {tStaff('userInformation')}
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('fullName')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.user.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder={tStaff('fullNamePlaceholder')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('fullNameBn')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.user.fullNameBn || ''}
                    onChange={e => handleInputChange('fullNameBn', e.target.value)}
                    placeholder={tStaff('fullNameBnPlaceholder')}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('email')} *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.user.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder={tStaff('emailPlaceholder')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('phone')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.user.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder={tStaff('phonePlaceholder')}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('gender')} *</label>
                  <select
                    className="form-select"
                    value={formData.user.gender}
                    onChange={e => handleInputChange('gender', e.target.value as 'male' | 'female' | 'other')}
                    required
                  >
                    <option value="male">{tStaff('male')}</option>
                    <option value="female">{tStaff('female')}</option>
                    <option value="other">{tStaff('other')}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('dateOfBirth')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.user.dateOfBirth || ''}
                    onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">{tStaff('address')}</label>
                <textarea
                  className="form-textarea"
                  value={formData.user.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                  rows={2}
                  placeholder={tStaff('addressPlaceholder')}
                />
              </div>
              <div className="form-field">
                <label className="form-label">{tStaff('password')} *</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    className="form-input pr-10"
                    value={formData.user.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    placeholder={tStaff('passwordPlaceholder')}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1">{tStaff('passwordHint')}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              {tStaff('professionalInformation')}
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('employeeId')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employeeId}
                    onChange={e => handleStaffFieldChange('employeeId', e.target.value)}
                    placeholder={tStaff('employeeIdPlaceholder')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('department')} *</label>
                  <select
                    className="form-select"
                    value={formData.departmentId}
                    onChange={e => handleStaffFieldChange('departmentId', e.target.value)}
                    required
                  >
                    <option value="">{tStaff('selectDepartment')}</option>
                    {departments?.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('designation')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.designation}
                    onChange={e => handleStaffFieldChange('designation', e.target.value)}
                    placeholder={tStaff('designationPlaceholder')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('specialization')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialization || ''}
                    onChange={e => handleStaffFieldChange('specialization', e.target.value)}
                    placeholder={tStaff('specializationPlaceholder')}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-field">
                  <label className="form-label">{tStaff('experienceYears')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.experienceYears || ''}
                    onChange={e => handleStaffFieldChange('experienceYears', e.target.value ? parseInt(e.target.value) : undefined)}
                    min={0}
                    max={60}
                    placeholder={tStaff('experiencePlaceholder')}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{tStaff('consultationFee')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.consultationFee || ''}
                    onChange={e => handleStaffFieldChange('consultationFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                    min={0}
                    step={0.01}
                    placeholder={tStaff('consultationFeePlaceholder')}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            {tStaff('qualifications')}
          </h2>
          <div className="space-y-3">
            {qualificationInputs.map((qual, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={qual}
                  onChange={e => handleQualificationChange(index, e.target.value)}
                  placeholder={index === 0 ? tStaff('qualificationPlaceholder') : ''}
                />
                {qualificationInputs.length > 1 && (
                  <button
                    type="button"
                    className="btn-ghost text-red-600 hover:text-red-700 p-2"
                    onClick={() => removeQualification(index)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost gap-2"
              onClick={addQualification}
            >
              <UserPlus className="w-4 h-4" />
              <span>{tStaff('addQualification')}</span>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            {tStaff('weeklySchedule')}
          </h2>
          <p className="text-sm text-text-muted mb-4">{tStaff('scheduleHint')}</p>
          <div className="space-y-2">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day.value}
                className={`border border-border rounded-lg overflow-hidden ${expandedDays.includes(day.value) ? 'bg-white' : 'bg-bg-secondary'}`}
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-tertiary transition-colors"
                  onClick={() => toggleDayExpanded(day.value)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-center font-medium text-text-primary">
                      {day.label.slice(0, 3)}
                    </span>
                    <span className="font-medium text-text-primary">{day.label}</span>
                    {day.labelBn && <span className="text-sm text-text-muted">({day.labelBn})</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.schedules.find(s => s.dayOfWeek === day.value)?.isAvailable}
                        onChange={e => handleScheduleChange(day.value, 'isAvailable', e.target.checked)}
                        className="rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary">{tStaff('available')}</span>
                    </label>
                    {expandedDays.includes(day.value) ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </button>
                {expandedDays.includes(day.value) && (
                  <div className="px-4 pb-4 border-t border-border bg-white animate-slide-down">
                    <div className="grid gap-4 md:grid-cols-2 pt-4">
                      <div className="form-field">
                        <label className="form-label">{tStaff('startTime')}</label>
                        <input
                          type="time"
                          className="form-input"
                          value={formData.schedules.find(s => s.dayOfWeek === day.value)?.startTime || '09:00'}
                          onChange={e => handleScheduleChange(day.value, 'startTime', e.target.value)}
                          disabled={!formData.schedules.find(s => s.dayOfWeek === day.value)?.isAvailable}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">{tStaff('endTime')}</label>
                        <input
                          type="time"
                          className="form-input"
                          value={formData.schedules.find(s => s.dayOfWeek === day.value)?.endTime || '17:00'}
                          onChange={e => handleScheduleChange(day.value, 'endTime', e.target.value)}
                          disabled={!formData.schedules.find(s => s.dayOfWeek === day.value)?.isAvailable}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            <X className="w-4 h-4" />
            <span>{t('cancel')}</span>
          </button>
          <button
            type="submit"
            className="btn-primary gap-2"
            disabled={createStaffMutation.isPending}
          >
            {createStaffMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('creating')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('create')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}