import { createContext, useContext, type ReactNode } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import type { Vendor, Supplier, Customer, Sale, UmrahPackage, Pilgrim, PaymentReceipt, BillPayment } from '../lib/types';

interface StoreType {
  vendors: ReturnType<typeof useSupabaseQuery<Vendor>>;
  suppliers: ReturnType<typeof useSupabaseQuery<Supplier>>;
  customers: ReturnType<typeof useSupabaseQuery<Customer>>;
  sales: ReturnType<typeof useSupabaseQuery<Sale>>;
  packages: ReturnType<typeof useSupabaseQuery<UmrahPackage>>;
  pilgrims: ReturnType<typeof useSupabaseQuery<Pilgrim>>;
  receipts: ReturnType<typeof useSupabaseQuery<PaymentReceipt>>;
  bills: ReturnType<typeof useSupabaseQuery<BillPayment>>;
}

const StoreContext = createContext<StoreType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const vendors = useSupabaseQuery<Vendor>('vendors');
  const suppliers = useSupabaseQuery<Supplier>('suppliers');
  const customers = useSupabaseQuery<Customer>('customers');
  const sales = useSupabaseQuery<Sale>('sales');
  const packages = useSupabaseQuery<UmrahPackage>('umrah_packages');
  const pilgrims = useSupabaseQuery<Pilgrim>('pilgrims');
  const receipts = useSupabaseQuery<PaymentReceipt>('payment_receipts');
  const bills = useSupabaseQuery<BillPayment>('bill_payments');

  return (
    <StoreContext.Provider value={{ vendors, suppliers, customers, sales, packages, pilgrims, receipts, bills }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
