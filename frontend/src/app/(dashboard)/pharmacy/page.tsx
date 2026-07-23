'use client';
import { PillBottle } from 'lucide-react';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function PharmacyPage() {
  return (
    <PlaceholderPage
      icon={<PillBottle className="w-6 h-6 text-primary-600" />}
      title="Pharmacy"
      description="Manage medicine inventory, dispensing, and stock alerts."
      features={['Medicine inventory management', 'Prescription dispensing', 'Stock adjustment & tracking', 'Low stock alerts', 'Supplier management', 'Sales & revenue tracking']}
    />
  );
}
