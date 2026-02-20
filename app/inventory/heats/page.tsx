'use server';

import { createClient } from '@/utils/supabase/server';
import { HeatList } from '@/components/HeatList';

export default async function HeatsPage() {
  const supabase = createClient();
  const { data: heats } = await supabase.from('heats').select('*').order('created_at', { ascending: false });
  const { data: wos } = await supabase
    .from('work_orders')
    .select('id, wo_number, status')
    .in('status', ['draft', 'approved', 'in_production', 'lab_pending', 'on_hold', 'reopened'])
    .order('created_at', { ascending: false });

  return (
    <HeatList initialHeats={heats || []} initialWOs={wos || []} />
  );
}
