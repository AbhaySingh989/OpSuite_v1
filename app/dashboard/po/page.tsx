'use server';

import { createClient } from '@/utils/supabase/server';
import { POList } from '@/components/POList';

export default async function PurchaseOrdersPage() {
  const supabase = createClient();
  const { data: pos } = await supabase
    .from('purchase_orders')
    .select('*, customers(name)')
    .order('created_at', { ascending: false });

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  return <POList initialPOs={pos || []} initialCustomers={customers || []} />;
}
