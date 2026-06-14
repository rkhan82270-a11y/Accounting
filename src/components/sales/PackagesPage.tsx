import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, Package, Users } from 'lucide-react';
import type { UmrahPackage } from '../../lib/types';

export default function PackagesPage() {
  const { packages, pilgrims } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UmrahPackage | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, start_date: '', end_date: '', status: 'active', capacity: 0 });

  const filtered = packages.items.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: 0, start_date: '', end_date: '', status: 'active', capacity: 0 }); setModalOpen(true); };
  const openEdit = (p: UmrahPackage) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: Number(p.price), start_date: p.start_date ?? '', end_date: p.end_date ?? '', status: p.status, capacity: p.capacity });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !user) return;
    const payload = { ...form, user_id: user.id, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editing) {
      await packages.update(editing.id, { ...form, start_date: form.start_date || null, end_date: form.end_date || null });
    } else {
      await packages.add(payload);
    }
    setModalOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);
  const statusColor = (s: string) => s === 'active' ? 'bg-emerald-100 text-emerald-700' : s === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';

  if (packages.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Umrah Packages" description="Create and manage custom Umrah packages" action={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Package
        </button>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search packages..." /></div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(pkg => {
          const pilgrimCount = pilgrims.items.filter(p => p.package_id === pkg.id).length;
          return (
            <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Package className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">{pkg.start_date ?? 'TBD'} - {pkg.end_date ?? 'TBD'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(pkg.status)}`}>{pkg.status}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pkg.description}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-slate-900">{fmt(Number(pkg.price))}</p>
                  <p className="text-xs text-slate-500">Price</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-slate-900">{pkg.capacity}</p>
                  <p className="text-xs text-slate-500">Capacity</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <p className="text-lg font-bold text-emerald-700">{pilgrimCount}</p>
                  </div>
                  <p className="text-xs text-emerald-600">Pilgrims</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => openEdit(pkg)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No packages found</div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Package' : 'New Umrah Package'}>
        <div className="space-y-4">
          <FormField label="Package Name" required><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramadan Umrah Special" /></FormField>
          <FormField label="Description"><textarea className={`${inputClass} h-20 resize-none`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Package details and inclusions" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (SAR)" required><input className={inputClass} type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></FormField>
            <FormField label="Capacity"><input className={inputClass} type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date"><input className={inputClass} type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></FormField>
            <FormField label="End Date"><input className={inputClass} type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></FormField>
          </div>
          <FormField label="Status">
            <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Create Package'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
