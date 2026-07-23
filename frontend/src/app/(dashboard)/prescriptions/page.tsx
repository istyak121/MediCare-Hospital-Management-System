'use client';
import { FileText } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function PrescriptionsPage() {
  return (
    <PlaceholderPage
      icon={<FileText className="w-6 h-6 text-primary-600" />}
      title="Prescriptions"
      description="Create, manage, and track patient prescriptions."
      features={['Create new prescriptions', 'Medicine search & selection', 'Dosage & duration tracking', 'Prescription history', 'Follow-up scheduling', 'Print & export']}
    />
  );
}
