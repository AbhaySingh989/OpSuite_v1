'use server';

import { createClient } from '@/utils/supabase/server';
import { CustomerList } from '@/components/CustomerList';
import { redirect } from 'next/navigation';

export default async function CustomersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Failed to load customers: {error.message}</div>;
  }

  return <CustomerList initialCustomers={customers || []} />;
}
