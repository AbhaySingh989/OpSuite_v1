'use server';

import { createClient } from '@/utils/supabase/server';
import { HeatList } from '@/components/HeatList';

export default async function HeatsPage() {
  const supabase = createClient();
  const { data: heats } = await supabase.from('heats').select('*').order('created_at', { ascending: false });

  return (
    <HeatList initialHeats={heats || []} />
  );
}
