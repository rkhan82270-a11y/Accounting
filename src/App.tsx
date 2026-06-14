import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StoreProvider } from './hooks/useAppStore';
import LoginPage from './components/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import VendorsPage from './components/contacts/VendorsPage';
import SuppliersPage from './components/contacts/SuppliersPage';
import CustomersPage from './components/contacts/CustomersPage';
import SalesPage from './components/sales/SalesPage';
import PackagesPage from './components/sales/PackagesPage';
import PilgrimsPage from './components/pilgrims/PilgrimsPage';
import ReceiptsPage from './components/accounting/ReceiptsPage';
import BillsPage from './components/accounting/BillsPage';
import CustomerLedger from './components/accounting/CustomerLedger';
import VendorLedger from './components/accounting/VendorLedger';

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <StoreProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/pilgrims" element={<PilgrimsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/customer-ledger" element={<CustomerLedger />} />
          <Route path="/vendor-ledger" element={<VendorLedger />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
