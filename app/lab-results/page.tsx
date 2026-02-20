'use server';

import { createClient } from '@/utils/supabase/server';
import { LabWOList } from '@/components/LabWOList';

export default async function LabPage() {
  const supabase = createClient();
  const { data: wos } = await supabase
    .from('work_orders')
    .select('*, items(item_code)')
    .in('status', ['in_production', 'lab_pending']) // Filter by status
    .order('created_at', { ascending: false });

  return (
    <LabWOList initialWOs={wos || []} />
  );
}
