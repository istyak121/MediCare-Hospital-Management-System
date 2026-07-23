'use client';
import { FlaskConical } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function LabPage() {
  return (
    <PlaceholderPage
      icon={<FlaskConical className="w-6 h-6 text-primary-600" />}
      title="Laboratory"
      description="Manage lab test requests, sample collection, and result reporting."
      features={['Test request management', 'Sample collection tracking', 'Result entry & validation', 'Test type catalog', 'Critical value alerts', 'Report generation']}
    />
  );
}
