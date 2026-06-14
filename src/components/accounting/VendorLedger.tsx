import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import { BookMarked, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function VendorLedger() {
  const { vendors, sales, bills, suppliers } = useStore();
  const [search, setSearch] = useState('');

  const allParties = [
    ...vendors.items.map(v => ({ id: v.id, name: v.name, company: v.company, kind: 'vendor' as const })),
    ...suppliers.items.map(s => ({ id: s.id, name: s.name, company: s.company, kind: 'supplier' as const })),
  ];

  const filtered = allParties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);

  if (vendors.loading || sales.loading || bills.loading || suppliers.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Vendor Ledger" description="Track amounts owed to vendors and suppliers" />

      <div className="mb-4 max-w-sm"><SearchBar value={search} onChange={setSearch} placeholder="Search vendors & suppliers..." /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Total Purchases</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Total Paid</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const totalPurchases = p.kind === 'vendor'
                  ? sales.items.filter(s => s.vendor_id === p.id).reduce((sum, s) => sum + Number(s.cost_price), 0)
                  : 0;
                const totalPaid = bills.items.filter(b =>
                  (p.kind === 'vendor' && b.vendor_id === p.id) || (p.kind === 'supplier' && b.supplier_id === p.id)
                ).reduce((sum, b) => sum + Number(b.amount), 0);
                const balance = totalPurchases - totalPaid;
                return (
                  <tr key={`${p.kind}-${p.id}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.kind === 'vendor' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          <BookMarked className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.company || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.kind === 'vendor' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{p.kind}</span></td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmt(totalPurchases)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600">{fmt(totalPaid)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold ${balance > 0 ? 'text-amber-600' : balance < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                        {balance > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : balance < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        {fmt(Math.abs(balance))}
                        {balance > 0 && <span className="text-xs font-normal ml-1">owing</span>}
                        {balance < 0 && <span className="text-xs font-normal ml-1">overpaid</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No vendors or suppliers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
