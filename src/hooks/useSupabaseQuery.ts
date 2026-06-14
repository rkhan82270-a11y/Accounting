import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type TableName = 'vendors' | 'suppliers' | 'customers' | 'sales' | 'umrah_packages' | 'pilgrims' | 'payment_receipts' | 'bill_payments';

export function useSupabaseQuery<T extends { id: string }>(table: TableName) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setItems((data ?? []) as T[]);
    setLoading(false);
  }, [table]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const add = useCallback(async (item: Omit<T, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from(table).insert([item]).select().single();
    if (err) { setError(err.message); return null; }
    if (data) setItems(prev => [data as T, ...prev]);
    return data as T | null;
  }, [table]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    const { data, error: err } = await supabase.from(table).update(updates).eq('id', id).select().single();
    if (err) { setError(err.message); return null; }
    if (data) setItems(prev => prev.map(item => item.id === id ? (data as T) : item));
    return data as T | null;
  }, [table]);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    setItems(prev => prev.filter(item => item.id !== id));
    return true;
  }, [table]);

  return { items, loading, error, refetch: fetchAll, add, update, remove };
}
