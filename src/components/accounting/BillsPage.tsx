import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, CreditCard } from 'lucide-react';
import type { BillPayment } from '../../lib/types';

export default function BillsPage() {
  const { bills, vendors, suppliers } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BillPayment | null>(null);
  const [form, setForm] = useState({ vendor_id: '', supplier_id: '', amount: 0, payment_method: 'cash', reference: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });

  const filtered = bills.items.filter(b => {
    const vName = b.vendor_id ? (vendors.items.find(v => v.id === b.vendor_id)?.name ?? '') : '';
    const sName = b.supplier_id ? (suppliers.items.find(s => s.id === b.supplier_id)?.name ?? '') : '';
    return vName.toLowerCase().includes(search.toLowerCase()) || sName.toLowerCase().includes(search.toLowerCase()) || b.reference.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setEditing(null); setForm({ vendor_id: '', supplier_id: '', amount: 0, payment_method: 'cash', reference: '', payment_date: new Date().toISOString().split('T')[0], notes: '' }); setModalOpen(true); };
  const openEdit = (b: BillPayment) => {
    setEditing(b);
    setForm({ vendor_id: b.vendor_id ?? '', supplier_id: b.supplier_id ?? '', amount: Number(b.amount), payment_method: b.payment_method, reference: b.reference, payment_date: b.payment_date, notes: b.notes });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.amount || (!form.vendor_id && !form.supplier_id) || !user) return;
    const payload = { ...form, user_id: user.id, vendor_id: form.vendor_id || null, supplier_id: form.supplier_id || null };
    if (editing) {
      await bills.update(editing.id, { ...form, vendor_id: form.vendor_id || null, supplier_id: form.supplier_id || null });
    } else {
      await bills.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);
  const getPayeeName = (b: BillPayment) => {
    if (b.vendor_id) return vendors.items.find(v => v.id === b.vendor_id)?.name ?? '-';
    if (b.supplier_id) return suppliers.items.find(s => s.id === b.supplier_id)?.name ?? '-';
    return '-';
  };
  const methodBadge = (m: string) => m === 'cash' ? 'bg-emerald-100 text-emerald-700' : m === 'bank_transfer' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

  if (bills.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Bill Payments" description="Record payments made to vendors and suppliers" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Payment
        </button>
      } />

      <div className="mb-4 max-w-sm"><SearchBar value={search} onChange={setSearch} placeholder="Search by vendor, supplier, reference..." /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Payee</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Method</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Reference</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Notes</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                      <span className="font-medium text-slate-900">{getPayeeName(b)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-amber-600">{fmt(Number(b.amount))}</td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${methodBadge(b.payment_method)}`}>{b.payment_method.replace('_', ' ')}</span></td>
                  <td className="px-5 py-3 text-slate-600">{b.reference || '-'}</td>
                  <td className="px-5 py-3 text-slate-500">{b.payment_date}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">{b.notes || '-'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No bill payments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Bill Payment' : 'New Bill Payment'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vendor">
              <select className={inputClass} value={form.vendor_id} onChange={e => setForm({ ...form, vendor_id: e.target.value, supplier_id: '' })}>
                <option value="">Select vendor</option>{vendors.items.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </FormField>
            <FormField label="Supplier">
              <select className={inputClass} value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value, vendor_id: '' })}>
                <option value="">Select supplier</option>{suppliers.items.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount (SAR)" required><input className={inputClass} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></FormField>
            <FormField label="Payment Method">
              <select className={inputClass} value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="card">Card</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Payment Date"><input className={inputClass} type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} /></FormField>
            <FormField label="Reference"><input className={inputClass} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. BILL-006" /></FormField>
          </div>
          <FormField label="Notes"><textarea className={`${inputClass} h-16 resize-none`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Payment details" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Record Payment'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
