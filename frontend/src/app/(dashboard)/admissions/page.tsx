'use client';
import { BedDouble } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function AdmissionsPage() {
  return (
    <PlaceholderPage
      icon={<BedDouble className="w-6 h-6 text-primary-600" />}
      title="Admissions & IPD"
      description="Manage patient admissions, bed assignments, and discharge."
      features={['Patient admission', 'Bed & ward management', 'Discharge processing', 'Progress notes', 'Bed transfer', 'Admission history']}
    />
  );
}
