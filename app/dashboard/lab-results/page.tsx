'use server';

import { createClient } from '@/utils/supabase/server';
import { LabWOList } from '@/components/LabWOList';

export default async function LabResultsPage() {
  const supabase = createClient();
  const { data: wos } = await supabase
    .from('work_orders')
    .select('*, items(item_code)')
    .in('status', ['in_production', 'lab_pending'])
    .order('created_at', { ascending: false });

  return <LabWOList initialWOs={wos || []} />;
}
