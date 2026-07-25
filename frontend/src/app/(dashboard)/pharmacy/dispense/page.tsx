'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispense } from '@/hooks/usePharmacy';
import { Syringe, Search, Plus, X, Loader2, ChevronLeft, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface CartItem {
  medicineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function DispensePage() {
  const router = useRouter();
  const dispense = useDispense();
  const [medSearch, setMedSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');

  const { data: medicinesData } = useQuery({
    queryKey: ['medicines', 'search', medSearch],
    queryFn: () => apiFetch('/pharmacy/medicines?search=' + encodeURIComponent(medSearch) + '&limit=10'),
    enabled: medSearch.length > 1,
  });
  const medicines = (medicinesData as any)?.data || [];

  const addToCart = (med: any) => {
    const existing = cart.find(c => c.medicineId === med.id);
    if (existing) {
      setCart(cart.map(c => c.medicineId === med.id ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      setCart([...cart, { medicineId: med.id, name: med.name, quantity: 1, unitPrice: med.sellingPrice, totalPrice: med.sellingPrice }]);
    }
    setMedSearch('');
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { setCart(cart.filter(c => c.medicineId !== id)); return; }
    setCart(cart.map(c => c.medicineId === id ? { ...c, quantity: qty, totalPrice: qty * c.unitPrice } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.medicineId !== id));
  };

  const handleDispense = async () => {
    if (!patientId) return toast.error('Enter a patient ID');
    if (cart.length === 0) return toast.error('Add at least one medicine');
    try {
      await dispense.mutateAsync({
        patientId,
        items: cart.map(c => ({ medicineId: c.medicineId, quantity: c.quantity, unitPrice: c.unitPrice })),
        notes: notes || undefined,
      });
      toast.success('Medicines dispensed successfully');
      setCart([]);
      setPatientId('');
      setNotes('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispense');
    }
  };

  const total = cart.reduce((sum, c) => sum + c.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/pharmacy')} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Syringe className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dispense Medicines</h1>
            <p className="text-sm text-text-muted">Process prescriptions and dispense to patients</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Patient</h3>
            <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Patient ID or phone number" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Search Medicines</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={medSearch} onChange={e => setMedSearch(e.target.value)} placeholder="Search by medicine name..." className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            {medSearch.length > 1 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border">
                {medicines.length === 0 ? (
                  <p className="text-sm text-text-muted p-3">No medicines found</p>
                ) : (
                  medicines.slice(0, 10).map((med: any) => (
                    <button key={med.id} type="button" onClick={() => addToCart(med)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-bg-secondary text-left">
                      <div>
                        <span className="font-medium text-text-primary">{med.name}</span>
                        <span className="text-text-muted ml-2">{med.genericName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-muted">Stock: {med.stockQuantity}</span>
                        <span className="text-primary-600 font-medium">{formatCurrency(med.sellingPrice)}</span>
                        <Plus className="w-4 h-4 text-primary-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Dispense Cart</h3>
            {cart.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border rounded-md">
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p>No items added</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.medicineId} className="flex items-center justify-between p-3 bg-bg-secondary rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="number" min="1" value={item.quantity} onChange={e => updateQty(item.medicineId, Number(e.target.value))} className="w-16 h-8 px-2 rounded border border-border bg-white text-sm text-center" />
                        <span className="text-sm text-text-muted">x {formatCurrency(item.unitPrice)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(item.totalPrice)}</span>
                      <button onClick={() => removeFromCart(item.medicineId)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>
              <div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dispense notes..." rows={2} className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm" />
              </div>
              <button onClick={handleDispense} disabled={dispense.isPending || cart.length === 0} className="w-full h-10 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {dispense.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <Package className="w-4 h-4" /> Dispense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
