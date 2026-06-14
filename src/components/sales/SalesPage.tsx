import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, Ticket, FileText } from 'lucide-react';
import type { Sale } from '../../lib/types';

export default function SalesPage() {
  const { sales, vendors, customers } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'visa' | 'ticket'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [form, setForm] = useState({
    type: 'visa', passenger_name: '', passenger_passport: '', passenger_mobile: '',
    vendor_id: '', cost_price: 0, selling_price: 0, customer_id: '',
    reference_agent: '', description: '', sale_date: new Date().toISOString().split('T')[0],
  });

  const filtered = sales.items.filter(s => {
    const matchSearch = s.passenger_name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()) || s.passenger_passport.includes(search);
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const openAdd = () => { setEditing(null); setForm({ type: 'visa', passenger_name: '', passenger_passport: '', passenger_mobile: '', vendor_id: '', cost_price: 0, selling_price: 0, customer_id: '', reference_agent: '', description: '', sale_date: new Date().toISOString().split('T')[0] }); setModalOpen(true); };
  const openEdit = (s: Sale) => {
    setEditing(s);
    setForm({ type: s.type, passenger_name: s.passenger_name, passenger_passport: s.passenger_passport, passenger_mobile: s.passenger_mobile, vendor_id: s.vendor_id ?? '', cost_price: Number(s.cost_price), selling_price: Number(s.selling_price), customer_id: s.customer_id ?? '', reference_agent: s.reference_agent, description: s.description, sale_date: s.sale_date });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.passenger_name.trim() || !user) return;
    const payload = { ...form, user_id: user.id, vendor_id: form.vendor_id || null, customer_id: form.customer_id || null };
    if (editing) {
      await sales.update(editing.id, { ...form, vendor_id: form.vendor_id || null, customer_id: form.customer_id || null });
    } else {
      await sales.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);
  const getVendorName = (id: string | null) => id ? (vendors.items.find(v => v.id === id)?.name ?? '-') : '-';
  const getCustomerName = (id: string | null) => id ? (customers.items.find(c => c.id === id)?.name ?? '-') : '-';

  if (sales.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Visa & Ticket Sales" description="Record ticket and visa sales with pricing details" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Sale
        </button>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by passenger, description..." /></div>
        <div className="flex gap-2">
          {(['all', 'visa', 'ticket'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === t ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {t === 'all' ? 'All' : t === 'visa' ? 'Visa' : 'Ticket'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Passenger</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Vendor</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Customer</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Cost</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Selling</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Profit</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const profit = Number(s.selling_price) - Number(s.cost_price);
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.type === 'visa' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                          {s.type === 'visa' ? <FileText className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{s.passenger_name}</p>
                          <p className="text-xs text-slate-500">{s.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.type === 'visa' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{s.type}</span></td>
                    <td className="px-5 py-3 text-slate-600">{getVendorName(s.vendor_id)}</td>
                    <td className="px-5 py-3 text-slate-600">{getCustomerName(s.customer_id)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmt(Number(s.cost_price))}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{fmt(Number(s.selling_price))}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">{fmt(profit)}</td>
                    <td className="px-5 py-3 text-slate-500">{s.sale_date}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-slate-400">No sales found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sale' : 'New Sale'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="visa">Visa</option><option value="ticket">Ticket</option>
              </select>
            </FormField>
            <FormField label="Sale Date"><input className={inputClass} type="date" value={form.sale_date} onChange={e => setForm({ ...form, sale_date: e.target.value })} /></FormField>
          </div>
          <FormField label="Passenger Name" required><input className={inputClass} value={form.passenger_name} onChange={e => setForm({ ...form, passenger_name: e.target.value })} placeholder="Full name" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Passport No."><input className={inputClass} value={form.passenger_passport} onChange={e => setForm({ ...form, passenger_passport: e.target.value })} placeholder="Passport number" /></FormField>
            <FormField label="Mobile"><input className={inputClass} value={form.passenger_mobile} onChange={e => setForm({ ...form, passenger_mobile: e.target.value })} placeholder="+92-xxx-xxxxxxx" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vendor">
              <select className={inputClass} value={form.vendor_id} onChange={e => setForm({ ...form, vendor_id: e.target.value })}>
                <option value="">Select vendor</option>{vendors.items.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </FormField>
            <FormField label="Customer">
              <select className={inputClass} value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer</option>{customers.items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cost Price (SAR)" required><input className={inputClass} type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: Number(e.target.value) })} /></FormField>
            <FormField label="Selling Price (SAR)" required><input className={inputClass} type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: Number(e.target.value) })} /></FormField>
          </div>
          <FormField label="Reference Agent"><input className={inputClass} value={form.reference_agent} onChange={e => setForm({ ...form, reference_agent: e.target.value })} placeholder="Agent who brought this passenger" /></FormField>
          <FormField label="Description"><input className={inputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Saudi Tourist Visa" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Record Sale'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
