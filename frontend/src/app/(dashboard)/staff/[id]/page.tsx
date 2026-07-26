'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, ArrowRight, Phone, Mail, MapPin, Briefcase, GraduationCap, CalendarDays, Clock, User, Building2, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useStaffMember } from '@/hooks/useStaff';
import { format } from 'date-fns';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', labelBn: 'রবিবার', short: 'Sun' },
  { value: 1, label: 'Monday', labelBn: 'সোমবার', short: 'Mon' },
  { value: 2, label: 'Tuesday', labelBn: 'মঙ্গলবার', short: 'Tue' },
  { value: 3, label: 'Wednesday', labelBn: 'বুধবার', short: 'Wed' },
  { value: 4, label: 'Thursday', labelBn: 'বৃহস্পতিবার', short: 'Thu' },
  { value: 5, label: 'Friday', labelBn: 'শুক্রবার', short: 'Fri' },
  { value: 6, label: 'Saturday', labelBn: 'শনিবার', short: 'Sat' },
];

export default function StaffProfilePage() {
  const t = useTranslations('common');
  const tStaff = useTranslations('staff');
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams();
  const staffId = params.id as string;

  const { data: staff, isLoading, error } = useStaffMember(staffId);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'activity'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/staff/${staffId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(tStaff('staffDeletedSuccess'));
      qc.invalidateQueries({ queryKey: ['staff'] });
      router.push('/staff');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || tStaff('staffDeleteError'));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{tStaff('staffProfile')}</h1>
              <p className="text-sm text-text-muted">{tStaff('viewStaffDetails')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border shadow-sm p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <span className="ml-3 text-text-muted">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{tStaff('staffProfile')}</h1>
              <p className="text-sm text-text-muted">{tStaff('viewStaffDetails')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">{t('notFound')}</h3>
          <p className="text-text-muted mb-6">{tStaff('staffNotFound')}</p>
          <button onClick={() => router.push('/staff')} className="btn-primary">
            <ArrowRight className="w-4 h-4 mr-2" />
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  const member = staff;

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      {isActive ? tStaff('active') : tStaff('inactive')}
    </span>
  );

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{member.user?.fullName || member.fullName}</h1>
            <p className="text-sm text-text-muted">{member.designation} • {member.department?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(member.user?.isActive !== false)}
          <button onClick={() => router.push(`/staff/${staffId}/edit`)} className="btn-secondary gap-2">
            <Edit className="w-4 h-4" />
            <span>{t('edit')}</span>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost text-red-600 hover:text-red-700 gap-2">
            <Trash2 className="w-4 h-4" />
            <span>{t('delete')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="border-b border-border px-6">
          <nav className="flex gap-1 pb-px -mb-px" aria-label="Staff profile tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tStaff('profile')}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tStaff('schedule')}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tStaff('activity')}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{tStaff('contactInformation')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('phone')}</p>
                        <p className="text-text-primary">{member.user?.phone || member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('email')}</p>
                        <p className="text-text-primary">{member.user?.email}</p>
                      </div>
                    </div>
                    {member.user?.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('address')}</p>
                          <p className="text-text-primary">{member.user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{tStaff('personalInformation')}</h3>
                  <div className="space-y-3">
                    {member.user?.fullNameBn && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('fullNameBn')}</p>
                          <p className="text-text-primary">{member.user.fullNameBn}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('gender')}</p>
                        <p className="text-text-primary capitalize">{member.user?.gender || member.gender}</p>
                      </div>
                    </div>
                    {member.user?.dateOfBirth && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('dateOfBirth')}</p>
                          <p className="text-text-primary">{format(new Date(member.user.dateOfBirth), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{tStaff('professionalDetails')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('employeeId')}</p>
                        <p className="text-text-primary font-mono">{member.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('department')}</p>
                        <p className="text-text-primary">{member.department?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted">{tStaff('designation')}</p>
                        <p className="text-text-primary">{member.designation}</p>
                      </div>
                    </div>
                    {member.specialization && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('specialization')}</p>
                          <p className="text-text-primary">{member.specialization}</p>
                        </div>
                      </div>
                    )}
                    {member.experienceYears !== null && member.experienceYears !== undefined && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('experienceYears')}</p>
                          <p className="text-text-primary">{member.experienceYears} {tStaff('years')}</p>
                        </div>
                      </div>
                    )}
                    {member.consultationFee !== null && member.consultationFee !== undefined && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted">{tStaff('consultationFee')}</p>
                          <p className="text-text-primary">৳{member.consultationFee.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {member.qualifications && member.qualifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">{tStaff('qualifications')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.qualifications.map((qual: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm border border-primary-100">
                        <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">{tStaff('weeklyScheduleDesc')}</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm font-medium text-text-muted">
                      <th className="pb-3 w-24">{tStaff('day')}</th>
                      <th className="pb-3">{tStaff('status')}</th>
                      <th className="pb-3">{tStaff('hours')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {DAYS_OF_WEEK.map(day => {
                      const schedule = member.schedules?.find((s: any) => parseInt(s.dayOfWeek) === day.value);
                      const isAvailable = schedule?.isAvailable;
                      return (
                        <tr key={day.value} className="hover:bg-bg-secondary transition-colors">
                          <td className="py-3 font-medium text-text-primary">
                            <span className="flex items-center gap-2">
                              <span className="w-8 text-center text-sm text-text-muted">{day.short}</span>
                              <span>{day.label}</span>
                              {day.labelBn && <span className="text-xs text-text-muted">({day.labelBn})</span>}
                            </span>
                          </td>
                          <td className="py-3">
                            {isAvailable ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {tStaff('available')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                {tStaff('notAvailable')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-text-muted">
                            {isAvailable && schedule ? (
                              <span className="font-mono">{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                            ) : (
                              <span className="text-text-muted italic">{tStaff('noHoursSet')}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">{tStaff('activityLogDesc')}</p>
              <div className="bg-bg-secondary rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <h4 className="text-lg font-medium text-text-primary mb-2">{tStaff('activityLogComingSoon')}</h4>
                <p className="text-text-muted">{tStaff('activityLogComingSoonDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{t('confirmDelete')}</h3>
            <p className="text-text-muted mb-6">{tStaff('confirmDeleteStaff', { name: member.user?.fullName || member.fullName })}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteConfirm(false);
                }}
                className="btn-destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
