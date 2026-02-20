'use server';

import { createClient } from '@/utils/supabase/server';
import { StandardList } from '@/components/StandardList';

export default async function StandardsPage() {
  const supabase = createClient();
  const { data: standards } = await supabase
    .from('standards')
    .select('*, standard_parameters(*)')
    .order('created_at', { ascending: false });

  return <StandardList initialStandards={standards || []} />;
}
