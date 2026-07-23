'use client';
import { Banknote } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function AccountantPage() {
  return (
    <PlaceholderPage
      icon={<Banknote className="w-6 h-6 text-primary-600" />}
      title="Accountant Dashboard"
      description="Financial overview, revenue tracking, and expense management."
      features={['Revenue & expense tracking', 'Daily collection report', 'Outstanding bills', 'Payment reconciliation', 'Financial reports', 'Insurance claims']}
    />
  );
}
