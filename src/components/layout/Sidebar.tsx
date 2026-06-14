import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Users, Building2, UserCircle, Ticket, Package,
  BookOpen, Receipt, CreditCard, BookMarked, LogOut, X, Moon,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/vendors', icon: Building2, label: 'Vendors' },
  { to: '/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
  { to: '/sales', icon: Ticket, label: 'Visa & Ticket Sales' },
  { to: '/packages', icon: Package, label: 'Umrah Packages' },
  { to: '/pilgrims', icon: BookOpen, label: 'Pilgrim Directory' },
  { to: '/receipts', icon: Receipt, label: 'Payment Receipts' },
  { to: '/bills', icon: CreditCard, label: 'Bill Payments' },
  { to: '/customer-ledger', icon: BookMarked, label: 'Customer Ledger' },
  { to: '/vendor-ledger', icon: BookMarked, label: 'Vendor Ledger' },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
            <div className="flex items-center justify-center w-9 h-9 bg-emerald-600 rounded-lg">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight">Umrah Travel</h1>
              <p className="text-slate-500 text-xs">Management System</p>
            </div>
            <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.email ?? 'Admin'}</p>
                <p className="text-slate-500 text-xs truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
