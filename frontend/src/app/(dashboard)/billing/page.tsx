'use client';

import { Receipt } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function BillingInvoicesPage() {
  return (
    <PlaceholderPage
      icon={<Receipt className="w-6 h-6 text-primary-600" />}
      title="Billing & Invoices"
      description="Manage patient invoices, process payments, and generate financial reports."
      features={[
        'Invoice generation (OPD, pharmacy, lab, IPD)',
        'Payment processing & receipts',
        'Daily collection report',
        'Outstanding bills tracking',
        'Insurance & discount support',
        'Financial analytics',
      ]}
    />
  );
}
