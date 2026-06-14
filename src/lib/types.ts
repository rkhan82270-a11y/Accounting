export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  outstanding_balance: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  balance: number;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  type: string;
  passenger_name: string;
  passenger_passport: string;
  passenger_mobile: string;
  vendor_id: string | null;
  cost_price: number;
  selling_price: number;
  customer_id: string | null;
  reference_agent: string;
  description: string;
  sale_date: string;
  created_at: string;
}

export interface UmrahPackage {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  capacity: number;
  created_at: string;
}

export interface Pilgrim {
  id: string;
  user_id: string;
  package_id: string;
  full_name: string;
  passport_number: string;
  mobile_number: string;
  full_address: string;
  reference_agent: string;
  created_at: string;
}

export interface PaymentReceipt {
  id: string;
  user_id: string;
  customer_id: string | null;
  amount: number;
  payment_method: string;
  reference: string;
  receipt_date: string;
  notes: string;
  created_at: string;
}

export interface BillPayment {
  id: string;
  user_id: string;
  vendor_id: string | null;
  supplier_id: string | null;
  amount: number;
  payment_method: string;
  reference: string;
  payment_date: string;
  notes: string;
  created_at: string;
}
