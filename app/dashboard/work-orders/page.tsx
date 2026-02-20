'use server';

import { createClient } from '@/utils/supabase/server';
import { WOList } from '@/components/WOList';

export default async function WorkOrdersPage() {
  const supabase = createClient();
  const { data: wos } = await supabase
    .from('work_orders')
    .select('*, purchase_orders(po_number), items(item_code)')
    .order('created_at', { ascending: false });

  return <WOList initialWOs={wos || []} />;
}
