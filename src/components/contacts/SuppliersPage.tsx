import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, Truck } from 'lucide-react';
import type { Supplier } from '../../lib/types';

export default function SuppliersPage() {
  const { suppliers } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', address: '', outstanding_balance: 0 });

  const filtered = suppliers.items.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const openAdd = () => { setEditing(null); setForm({ name: '', company: '', phone: '', email: '', address: '', outstanding_balance: 0 }); setModalOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name: s.name, company: s.company, phone: s.phone, email: s.email, address: s.address, outstanding_balance: Number(s.outstanding_balance) }); setModalOpen(true); };

  const save = async () => {
    if (!form.name.trim() || !user) return;
    const payload = { ...form, user_id: user.id };
    if (editing) {
      await suppliers.update(editing.id, form);
    } else {
      await suppliers.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);

  if (suppliers.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Suppliers" description="Track supplier profiles and outstanding balances" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      } />

      <div className="mb-4 max-w-sm"><SearchBar value={search} onChange={setSearch} placeholder="Search suppliers..." /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Company</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Phone</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Outstanding</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><Truck className="w-4 h-4" /></div>
                      <span className="font-medium text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.company || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.phone || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.email || '-'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-amber-600">{fmt(Number(s.outstanding_balance))}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No suppliers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <div className="space-y-4">
          <FormField label="Name" required><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" /></FormField>
          <FormField label="Company"><input className={inputClass} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></FormField>
          <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+966-5x-xxxxxxx" /></FormField>
          <FormField label="Email"><input className={inputClass} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="supplier@email.com" /></FormField>
          <FormField label="Address"><input className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" /></FormField>
          <FormField label="Outstanding Balance (SAR)"><input className={inputClass} type="number" value={form.outstanding_balance} onChange={e => setForm({ ...form, outstanding_balance: Number(e.target.value) })} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Add Supplier'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
