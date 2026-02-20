'use server';

import { createClient } from '@/utils/supabase/server';
import { TCDashboard } from '@/components/TCDashboard';

export default async function TCPage() {
  const supabase = createClient();
  const { data: tcs } = await supabase
    .from('test_certificates')
    .select('*, work_orders(wo_number, customers(name))')
    .order('created_at', { ascending: false });

  return (
    <TCDashboard initialTCs={tcs || []} />
  );
}
