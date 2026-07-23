'use client';
import { UserCog } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function StaffPage() {
  return (
    <PlaceholderPage
      icon={<UserCog className="w-6 h-6 text-primary-600" />}
      title="Staff Management"
      description="Manage hospital staff, roles, departments, and schedules."
      features={['Staff directory', 'Department assignment', 'Role & permission management', 'Schedule management', 'Staff attendance', 'Performance tracking']}
    />
  );
}
