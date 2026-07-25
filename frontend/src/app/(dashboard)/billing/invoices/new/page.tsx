'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Plus, X, Search, Loader2, ChevronLeft, FileText } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

const ITEM_TYPES = ['CONSULTATION', 'MEDICINE', 'LAB_TEST', 'PROCEDURE', 'ROOM_CHARGE', 'OTHER'];

interface InvoiceItem {
  id: string;
  description: string;
  itemType: string;
  medicineId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiFetch('/patients?limit=1000'),
  });
  const patients = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || [];

  const { data: medicinesData } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => apiFetch('/pharmacy/medicines?limit=1000'),
  });
  const medicines = Array.isArray(medicinesData) ? medicinesData : (medicinesData as any)?.data || [];

  const createInvoice = useMutation({
    mutationFn: (data: any) => apiFetch('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Invoice created');
      qc.invalidateQueries({ queryKey: ['invoices'] });
      router.push('/billing');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create invoice'),
  });

  const [form, setForm] = useState({
    patientId: '',
    admissionId: '',
    invoiceType: 'OPD',
    items: [] as InvoiceItem[],
    discount: 0,
    tax: 0,
    notes: '',
  });

  const [search, setSearch] = useState('');
  const [itemType, setItemType] = useState('CONSULTATION');
  const [customDesc, setCustomDesc] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [medSearch, setMedSearch] = useState('');

  const subtotal = form.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalAmount = subtotal - form.discount + form.tax;

  const addItem = (item: Omit<InvoiceItem, 'id' | 'totalPrice'>) => {
    const newItem: InvoiceItem = {
      ...item,
      id: crypto.randomUUID(),
      totalPrice: item.quantity * item.unitPrice,
    };
    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleAddMedicine = (med: any) => {
    addItem({
      description: med.name,
      itemType: 'MEDICINE',
      medicineId: med.id,
      quantity: 1,
      unitPrice: med.sellingPrice,
    });
  };

  const handleAddConsultation = (fee: number) => {
    addItem({
      description: 'Consultation Fee',
      itemType: 'CONSULTATION',
      quantity: 1,
      unitPrice: fee,
    });
  };

  const handleAddCustomItem = () => {
    if (!customDesc.trim()) {
      toast.error('Enter a description');
      return;
    }
    if (customQty <= 0 || customPrice <= 0) {
      toast.error('Enter valid quantity and price');
      return;
    }
    addItem({
      description: customDesc.trim(),
      itemType: itemType,
      quantity: customQty,
      unitPrice: customPrice,
    });
    setCustomDesc('');
    setCustomQty(1);
    setCustomPrice(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return toast.error('Select a patient');
    if (form.items.length === 0) return toast.error('Add at least one item');

    const payload = {
      patientId: form.patientId,
      admissionId: form.admissionId || null,
      invoiceType: form.invoiceType,
      discount: form.discount,
      tax: form.tax,
      items: form.items.map(i => ({
        description: i.description,
        itemType: i.itemType,
        medicineId: i.medicineId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      notes: form.notes,
    };
    await createInvoice.mutateAsync(payload);
  };

  const patient = patients.find((p: any) => p.id === form.patientId);
  const filteredMedicines = medicines.filter((m: any) =>
    medSearch ? m.name?.toLowerCase().includes(medSearch.toLowerCase()) || m.genericName?.toLowerCase().includes(medSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-bg-tertiary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Invoice</h1>
            <p className="text-sm text-text-muted">Create a new billing invoice</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Patient & Invoice Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Patient *</label>
              <select
                value={form.patientId}
                onChange={e => setForm(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select patient</option>
                {patients.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId || p.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Invoice Type *</label>
              <select
                value={form.invoiceType}
                onChange={e => setForm(prev => ({ ...prev, invoiceType: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="LAB">Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Admission ID (optional)</label>
              <input
                type="text"
                value={form.admissionId}
                onChange={e => setForm(prev => ({ ...prev, admissionId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm"
                placeholder="ADM-XXXX-XXX"
              />
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Invoice Items</h3>

          {/* Medicine search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Search Medicines</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={medSearch}
                onChange={e => setMedSearch(e.target.value)}
                placeholder="Search by name or generic name..."
                className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {medSearch && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border">
                {filteredMedicines.length === 0 ? (
                  <p className="text-sm text-text-muted p-3">No medicines found</p>
                ) : (
                  filteredMedicines.slice(0, 10).map((med: any) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => handleAddMedicine(med)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-bg-secondary text-left"
                    >
                      <div>
                        <span className="font-medium text-text-primary">{med.name}</span>
                        <span className="text-text-muted ml-2">{med.genericName}</span>
                      </div>
                      <span className="text-primary-600 font-medium">{formatCurrency(med.sellingPrice)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick consultation */}
          {patient?.consultationFee && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Quick Add</label>
              <button
                type="button"
                onClick={() => handleAddConsultation(Number(patient.consultationFee))}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 border border-primary-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Consultation ({formatCurrency(patient.consultationFee)})
              </button>
            </div>
          )}

          {/* Custom item */}
          <div className="border border-border rounded-md p-4 bg-bg-secondary">
            <label className="block text-sm font-medium text-text-secondary mb-3">Add Custom Item</label>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                />
              </div>
              <div>
                <select
                  value={itemType}
                  onChange={e => setItemType(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                >
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={customQty}
                  onChange={e => setCustomQty(Number(e.target.value))}
                  placeholder="Qty"
                  className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice}
                  onChange={e => setCustomPrice(Number(e.target.value))}
                  placeholder="Price"
                  className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="w-full h-9 px-3 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 inline-flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Items table */}
          {form.items.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Description</th>
                    <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-secondary">Type</th>
                    <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Qty</th>
                    <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Unit Price</th>
                    <th className="px-4 py-2.5 text-right text-sm font-semibold text-text-secondary">Total</th>
                    <th className="px-4 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="px-4 py-2.5 text-sm text-text-primary">{item.description}</td>
                      <td className="px-4 py-2.5 text-sm">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {item.itemType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-text-secondary">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-text-primary">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-text-primary">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button type="button" onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border rounded-md mt-4">
              No items added yet. Search medicines above or use the custom item form.
            </div>
          )}
        </div>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Discount & Tax</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Discount (BDT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={e => setForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tax (BDT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.tax}
                  onChange={e => setForm(prev => ({ ...prev, tax: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Items</span>
                <span>{form.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount</span>
                <span className="text-danger">-{formatCurrency(form.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="font-medium">{formatCurrency(form.tax)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 rounded-md border border-border bg-white text-sm font-medium text-text-secondary hover:bg-bg-tertiary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createInvoice.isPending}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {createInvoice.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
