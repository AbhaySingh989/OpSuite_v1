'use server';

import { createClient } from '@/utils/supabase/server';
import { WOList } from '@/components/WOList';
import { getPOs } from '@/app/actions/po';
import { getItems } from '@/app/actions/items';

export default async function WorkOrdersPage() {
  const supabase = createClient();

  const [wosResult, pos, items] = await Promise.all([
    supabase
      .from('work_orders')
      .select('*, purchase_orders(po_number), items(item_code)')
      .order('created_at', { ascending: false }),
    getPOs(),
    getItems()
  ]);

  const wos = wosResult.data;

  return <WOList initialWOs={wos || []} pos={pos || []} items={items || []} />;
}
