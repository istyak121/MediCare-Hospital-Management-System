'use client';

import { useTranslations } from 'next-intl';
import { UserCog, ArrowRight } from 'lucide-react';

export default function StaffProfilePage() {
  const t = useTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Staff Profile</h1>
            <p className="text-sm text-text-muted">View staff details, schedule, assigned patients, and performance metrics.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
            <UserCog className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Coming in Phase 2</h3>
          <p className="text-text-muted max-w-md mb-6">
            This module is fully specified in the design document and will be implemented in the next phase.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-600 font-medium">
            <span>View API docs</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
