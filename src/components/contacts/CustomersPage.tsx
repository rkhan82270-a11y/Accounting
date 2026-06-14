import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, UserCircle } from 'lucide-react';
import type { Customer } from '../../lib/types';

export default function CustomersPage() {
  const { customers } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'individual' | 'corporate'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', address: '', type: 'individual' as string, balance: 0 });

  const filtered = customers.items.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchType = filter === 'all' || c.type === filter;
    return matchSearch && matchType;
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', company: '', phone: '', email: '', address: '', type: 'individual', balance: 0 }); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, company: c.company, phone: c.phone, email: c.email, address: c.address, type: c.type, balance: Number(c.balance) }); setModalOpen(true); };

  const save = async () => {
    if (!form.name.trim() || !user) return;
    const payload = { ...form, user_id: user.id };
    if (editing) {
      await customers.update(editing.id, form);
    } else {
      await customers.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);
  const typeBadge = (t: string) => t === 'corporate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700';

  if (customers.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Customers" description="Directory of clients and corporate buyers" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>
        <div className="flex gap-2">
          {(['all', 'individual', 'corporate'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {t === 'all' ? 'All' : t === 'individual' ? 'Individual' : 'Corporate'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Company</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Phone</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Balance</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center"><UserCircle className="w-4 h-4" /></div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.company || '-'}</td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(c.type)}`}>{c.type}</span></td>
                  <td className="px-5 py-3 text-slate-600">{c.phone || '-'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">{fmt(Number(c.balance))}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-4">
          <FormField label="Name" required><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" /></FormField>
          <FormField label="Company"><input className={inputClass} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company (if corporate)" /></FormField>
          <FormField label="Type">
            <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
            </select>
          </FormField>
          <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+966-5x-xxxxxxx" /></FormField>
          <FormField label="Email"><input className={inputClass} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" /></FormField>
          <FormField label="Address"><input className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" /></FormField>
          <FormField label="Balance (SAR)"><input className={inputClass} type="number" value={form.balance} onChange={e => setForm({ ...form, balance: Number(e.target.value) })} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Add Customer'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
