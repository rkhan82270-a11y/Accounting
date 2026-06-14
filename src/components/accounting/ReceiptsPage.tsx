import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, Receipt } from 'lucide-react';
import type { PaymentReceipt } from '../../lib/types';

export default function ReceiptsPage() {
  const { receipts, customers } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentReceipt | null>(null);
  const [form, setForm] = useState({ customer_id: '', amount: 0, payment_method: 'cash', reference: '', receipt_date: new Date().toISOString().split('T')[0], notes: '' });

  const filtered = receipts.items.filter(r => {
    const cust = customers.items.find(c => c.id === r.customer_id);
    const matchSearch = (cust?.name ?? '').toLowerCase().includes(search.toLowerCase()) || r.reference.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === 'all' || r.payment_method === methodFilter;
    return matchSearch && matchMethod;
  });

  const methods = [...new Set(receipts.items.map(r => r.payment_method))];

  const openAdd = () => { setEditing(null); setForm({ customer_id: '', amount: 0, payment_method: 'cash', reference: '', receipt_date: new Date().toISOString().split('T')[0], notes: '' }); setModalOpen(true); };
  const openEdit = (r: PaymentReceipt) => {
    setEditing(r);
    setForm({ customer_id: r.customer_id ?? '', amount: Number(r.amount), payment_method: r.payment_method, reference: r.reference, receipt_date: r.receipt_date, notes: r.notes });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.customer_id || !form.amount || !user) return;
    const payload = { ...form, user_id: user.id, customer_id: form.customer_id || null };
    if (editing) {
      await receipts.update(editing.id, { ...form, customer_id: form.customer_id || null });
    } else {
      await receipts.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);
  const getCustName = (id: string | null) => id ? (customers.items.find(c => c.id === id)?.name ?? '-') : '-';
  const methodBadge = (m: string) => m === 'cash' ? 'bg-emerald-100 text-emerald-700' : m === 'bank_transfer' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

  if (receipts.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Payment Receipts" description="Record payments received from customers and agents" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Receipt
        </button>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by customer, reference..." /></div>
        <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
          <option value="all">All Methods</option>
          {methods.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Customer</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Method</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Reference</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Notes</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Receipt className="w-4 h-4" /></div>
                      <span className="font-medium text-slate-900">{getCustName(r.customer_id)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600">{fmt(Number(r.amount))}</td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${methodBadge(r.payment_method)}`}>{r.payment_method.replace('_', ' ')}</span></td>
                  <td className="px-5 py-3 text-slate-600">{r.reference || '-'}</td>
                  <td className="px-5 py-3 text-slate-500">{r.receipt_date}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">{r.notes || '-'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No receipts found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Receipt' : 'New Payment Receipt'}>
        <div className="space-y-4">
          <FormField label="Customer" required>
            <select className={inputClass} value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select customer</option>{customers.items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount (SAR)" required><input className={inputClass} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></FormField>
            <FormField label="Payment Method">
              <select className={inputClass} value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="card">Card</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Receipt Date"><input className={inputClass} type="date" value={form.receipt_date} onChange={e => setForm({ ...form, receipt_date: e.target.value })} /></FormField>
            <FormField label="Reference"><input className={inputClass} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. RCPT-006" /></FormField>
          </div>
          <FormField label="Notes"><textarea className={`${inputClass} h-16 resize-none`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Payment details" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Record Receipt'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
