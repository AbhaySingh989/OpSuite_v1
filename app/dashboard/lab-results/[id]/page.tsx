'use server';

import { createClient } from '@/utils/supabase/server';
import { LabEntry } from '@/components/LabEntry';
import { initializeLabResult } from '@/app/actions/lab';

export default async function LabEntryPage({ params }: { params: { id: string } }) {
  const res = await initializeLabResult(params.id);

  if (res.error) {
    return <div>Error initializing lab result: {res.error}</div>;
  }

  const supabase = createClient();
  const { data: result } = await supabase
    .from('lab_results')
    .select('*, lab_result_parameters(*, standard_parameters(*))')
    .eq('id', res.id)
    .single();

  const { data: wo } = await supabase
    .from('work_orders')
    .select('*, items(item_code)')
    .eq('id', params.id)
    .single();

  return <LabEntry result={result} wo={wo} />;
}
