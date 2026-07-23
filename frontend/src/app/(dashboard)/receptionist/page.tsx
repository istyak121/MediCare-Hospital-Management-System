'use client';
import { Calendar } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function ReceptionistDashboardPage() {
  return (
    <PlaceholderPage
      icon={<Calendar className="w-6 h-6 text-primary-600" />}
      title="Receptionist Dashboard"
      description="Today's appointment queue, patient registrations, and quick actions."
      features={['Patient registration & search', 'Appointment booking', 'Queue management', 'Quick check-in', 'Billing & receipt printing', 'Patient inquiries']}
    />
  );
}
