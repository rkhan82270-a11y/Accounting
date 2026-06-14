import { useState } from 'react';
import { useStore } from '../../hooks/useAppStore';
import SearchBar from '../shared/SearchBar';
import PageHeader from '../shared/PageHeader';
import { BookMarked, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CustomerLedger() {
  const { customers, sales, receipts } = useStore();
  const [search, setSearch] = useState('');

  const filtered = customers.items.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);

  if (customers.loading || sales.loading || receipts.loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Customer Ledger" description="Track amounts owed by each customer" />

      <div className="mb-4 max-w-sm"><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Total Sales</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Total Paid</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const totalSales = sales.items.filter(s => s.customer_id === c.id).reduce((sum, s) => sum + Number(s.selling_price), 0);
                const totalPaid = receipts.items.filter(r => r.customer_id === c.id).reduce((sum, r) => sum + Number(r.amount), 0);
                const balance = totalSales - totalPaid;
                return (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center"><BookMarked className="w-4 h-4" /></div>
                        <div>
                          <p className="font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.company || 'Individual'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'corporate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{c.type}</span></td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmt(totalSales)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600">{fmt(totalPaid)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold ${balance > 0 ? 'text-amber-600' : balance < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                        {balance > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : balance < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        {fmt(Math.abs(balance))}
                        {balance > 0 && <span className="text-xs font-normal ml-1">due</span>}
                        {balance < 0 && <span className="text-xs font-normal ml-1">overpaid</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
