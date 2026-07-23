'use client';
import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function ReportsPage() {
  return (
    <PlaceholderPage
      icon={<BarChart3 className="w-6 h-6 text-primary-600" />}
      title="Reports & Analytics"
      description="Hospital-wide analytics, patient statistics, and financial reports."
      features={['Patient statistics', 'Revenue analytics', 'Bed occupancy rates', 'Top diagnoses', 'Staff performance', 'Export to PDF/Excel']}
    />
  );
}
