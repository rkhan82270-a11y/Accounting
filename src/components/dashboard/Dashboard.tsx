import { useStore } from '../../hooks/useAppStore';
import {
  TrendingUp, DollarSign, Clock, Receipt,
  ArrowUpRight, Users, Building2, Package, Ticket,
} from 'lucide-react';

export default function Dashboard() {
  const { vendors, customers, packages, sales, receipts, bills } = useStore();

  const totalSales = sales.items.reduce((sum, s) => sum + Number(s.selling_price), 0);
  const totalCost = sales.items.reduce((sum, s) => sum + Number(s.cost_price), 0);
  const totalCollections = receipts.items.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalPayments = bills.items.reduce((sum, b) => sum + Number(b.amount), 0);
  const pendingBills = vendors.items.reduce((sum, v) => sum + Number(v.balance), 0);
  const activePackages = packages.items.filter(p => p.status === 'active').length;
  const totalProfit = totalSales - totalCost;

  const stats = [
    { label: 'Total Sales', value: totalSales, icon: TrendingUp, color: 'emerald' },
    { label: 'Total Collections', value: totalCollections, icon: DollarSign, color: 'blue' },
    { label: 'Pending Bills', value: pendingBills, icon: Clock, color: 'amber' },
    { label: 'Total Profit', value: totalProfit, icon: Receipt, color: 'teal' },
  ];

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n);

  const iconBg: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  const isLoading = vendors.loading || sales.loading || receipts.loading || bills.loading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your travel & Umrah agency operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full text-slate-500 bg-slate-50">
                <ArrowUpRight className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{fmt(stat.value)}</p>
            <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Vendors</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{vendors.items.length}</p>
          <p className="text-slate-500 text-sm">Total registered vendors</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Active Packages</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activePackages}</p>
          <p className="text-slate-500 text-sm">Currently active Umrah packages</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Customers</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{customers.items.length}</p>
          <p className="text-slate-500 text-sm">Total registered customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Sales</h3>
            <Ticket className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {sales.items.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{sale.passenger_name}</p>
                  <p className="text-xs text-slate-500">{sale.type === 'visa' ? 'Visa' : 'Ticket'} - {sale.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{fmt(Number(sale.selling_price))}</p>
                  <p className="text-xs text-slate-500">{sale.sale_date}</p>
                </div>
              </div>
            ))}
            {sales.items.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No sales yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Receipts</h3>
            <Receipt className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {receipts.items.slice(0, 5).map(r => {
              const cust = customers.items.find(c => c.id === r.customer_id);
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cust?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{r.payment_method} - {r.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{fmt(Number(r.amount))}</p>
                    <p className="text-xs text-slate-500">{r.receipt_date}</p>
                  </div>
                </div>
              );
            })}
            {receipts.items.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No receipts yet</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Cash Flow Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
            <p className="text-sm font-medium">Money In</p>
            <p className="text-xl font-bold mt-1">{fmt(totalCollections)}</p>
          </div>
          <div className="p-4 rounded-lg border bg-amber-50 text-amber-600 border-amber-200">
            <p className="text-sm font-medium">Money Out</p>
            <p className="text-xl font-bold mt-1">{fmt(totalPayments)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${totalCollections - totalPayments >= 0 ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            <p className="text-sm font-medium">Net Position</p>
            <p className="text-xl font-bold mt-1">{fmt(totalCollections - totalPayments)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
