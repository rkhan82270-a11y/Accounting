import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import Modal from '../shared/Modal';
import FormField, { inputClass } from '../shared/FormField';
import { Plus, Edit2, Trash2, Users, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { Pilgrim } from '../../lib/types';

export default function PilgrimsPage() {
  const { packages, pilgrims } = useStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pilgrim | null>(null);
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);
  const [form, setForm] = useState({ package_id: '', full_name: '', passport_number: '', mobile_number: '', full_address: '', reference_agent: '' });

  const filtered = pilgrims.items.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.passport_number.includes(search) || p.reference_agent.toLowerCase().includes(search.toLowerCase());
    const matchPkg = selectedPackage === 'all' || p.package_id === selectedPackage;
    return matchSearch && matchPkg;
  });

  const grouped = packages.items.map(pkg => ({ package: pkg, pilgrims: filtered.filter(p => p.package_id === pkg.id) }));
  const unassigned = filtered.filter(p => !packages.items.find(pkg => pkg.id === p.package_id));

  const openAdd = (packageId?: string) => {
    setEditing(null);
    setForm({ package_id: packageId ?? (selectedPackage !== 'all' ? selectedPackage : ''), full_name: '', passport_number: '', mobile_number: '', full_address: '', reference_agent: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Pilgrim) => {
    setEditing(p);
    setForm({ package_id: p.package_id, full_name: p.full_name, passport_number: p.passport_number, mobile_number: p.mobile_number, full_address: p.full_address, reference_agent: p.reference_agent });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.package_id || !user) return;
    const payload = { ...form, user_id: user.id };
    if (editing) {
      await pilgrims.update(editing.id, form);
    } else {
      await pilgrims.add(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await pilgrims.remove(id);
  };

  if (pilgrims.loading || packages.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Pilgrim Directory" description="Manage passengers for each Umrah package" action={
        <button onClick={() => openAdd()} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Pilgrim
        </button>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search pilgrims, passport, agent..." /></div>
        <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)}>
          <option value="all">All Packages</option>
          {packages.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {grouped.filter(g => g.pilgrims.length > 0 || g.package.id === expandedPkg).map(({ package: pkg, pilgrims: pList }) => {
          const isExpanded = expandedPkg === pkg.id || selectedPackage === pkg.id || pList.length > 0;
          return (
            <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setExpandedPkg(isExpanded && expandedPkg === pkg.id ? null : pkg.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">{pkg.start_date ?? 'TBD'} - {pkg.end_date ?? 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                    <Users className="w-3.5 h-3.5" /> {pList.length} pilgrims
                  </span>
                  <button onClick={e => { e.stopPropagation(); openAdd(pkg.id); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Plus className="w-4 h-4" /></button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50">
                        <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Full Name</th>
                        <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Passport</th>
                        <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Mobile</th>
                        <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Address</th>
                        <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Ref. Agent</th>
                        <th className="text-right px-5 py-2.5 font-semibold text-slate-600">Actions</th>
                      </tr></thead>
                      <tbody>
                        {pList.map(p => (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900">{p.full_name}</td>
                            <td className="px-5 py-3 text-slate-600">{p.passport_number || '-'}</td>
                            <td className="px-5 py-3 text-slate-600">{p.mobile_number || '-'}</td>
                            <td className="px-5 py-3 text-slate-600 max-w-[200px] truncate">{p.full_address || '-'}</td>
                            <td className="px-5 py-3">{p.reference_agent ? <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{p.reference_agent}</span> : '-'}</td>
                            <td className="px-5 py-3 text-right">
                              <div className="inline-flex gap-1">
                                <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pList.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-slate-400">No pilgrims in this package</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {unassigned.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Unassigned Pilgrims</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50">
                  <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Full Name</th>
                  <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Passport</th>
                  <th className="text-left px-5 py-2.5 font-semibold text-slate-600">Mobile</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-slate-600">Actions</th>
                </tr></thead>
                <tbody>
                  {unassigned.map(p => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-900">{p.full_name}</td>
                      <td className="px-5 py-3 text-slate-600">{p.passport_number || '-'}</td>
                      <td className="px-5 py-3 text-slate-600">{p.mobile_number || '-'}</td>
                      <td className="px-5 py-3 text-right"><button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">No pilgrims found</div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pilgrim' : 'Add Pilgrim'}>
        <div className="space-y-4">
          <FormField label="Package" required>
            <select className={inputClass} value={form.package_id} onChange={e => setForm({ ...form, package_id: e.target.value })}>
              <option value="">Select package</option>{packages.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FormField>
          <FormField label="Full Name" required><input className={inputClass} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Pilgrim full name" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Passport Number"><input className={inputClass} value={form.passport_number} onChange={e => setForm({ ...form, passport_number: e.target.value })} placeholder="Passport number" /></FormField>
            <FormField label="Mobile Number"><input className={inputClass} value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })} placeholder="+92-xxx-xxxxxxx" /></FormField>
          </div>
          <FormField label="Full Address"><textarea className={`${inputClass} h-16 resize-none`} value={form.full_address} onChange={e => setForm({ ...form, full_address: e.target.value })} placeholder="Complete address" /></FormField>
          <FormField label="Reference Agent / Person"><input className={inputClass} value={form.reference_agent} onChange={e => setForm({ ...form, reference_agent: e.target.value })} placeholder="Who brought this passenger" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition shadow-sm">{editing ? 'Update' : 'Add Pilgrim'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
