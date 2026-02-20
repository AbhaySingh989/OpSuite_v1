'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { MasterDataTabs } from '@/components/MasterDataTabs';

export default async function MasterDataPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: customers, error: customersError }, { data: items, error: itemsError }, { data: standards, error: standardsError }] =
    await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('standards').select('*, standard_parameters(*)').order('created_at', { ascending: false }),
    ]);

  return (
    <MasterDataTabs
      customers={customers || []}
      items={items || []}
      standards={(standards as any) || []}
      customersError={customersError?.message || null}
      itemsError={itemsError?.message || null}
      standardsError={standardsError?.message || null}
    />
  );
}
