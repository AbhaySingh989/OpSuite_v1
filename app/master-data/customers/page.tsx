'use server';

import { createClient } from '@/utils/supabase/server';
import { CustomerList } from '@/components/CustomerList';

export default async function CustomersPage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from('customers').select('*').order('created_at', { ascending: false });

  return (
    <CustomerList initialCustomers={customers || []} />
  );
}
