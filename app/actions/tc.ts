'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function generateTC(woId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return { error: 'No plant assigned' };

  const { data: workOrder, error: woError } = await supabase
    .from('work_orders')
    .select('id')
    .eq('id', woId)
    .single();

  if (woError || !workOrder) return { error: 'Work order not found' };

  const { data: results } = await supabase
    .from('lab_results')
    .select('*, lab_result_parameters(*)')
    .eq('work_order_id', woId)
    .single();

  if (!results) return { error: 'No lab results found' };
  if (!results.lab_result_parameters?.length) return { error: 'No lab parameters found' };

  const hasFailures = results.lab_result_parameters.some((p: any) => p.validation_status === 'failed');
  if (hasFailures) return { error: 'Cannot generate TC with failed parameters. Override required.' };

  const { data: existingTC } = await supabase
    .from('test_certificates')
    .select('id, current_version')
    .eq('work_order_id', woId)
    .single();

  let tcId = existingTC?.id;
  let nextVersion = (existingTC?.current_version || 0) + 1;

  if (!tcId) {
    const { data: newTC, error: tcError } = await supabase
      .from('test_certificates')
      .insert({
        plant_id: userRole.plant_id,
        work_order_id: woId,
        current_version: 0,
        status: 'prepared',
      })
      .select()
      .single();

    if (tcError || !newTC) return { error: tcError?.message || 'Failed to create TC header' };
    tcId = newTC.id;
    nextVersion = 1;
  }

  const pdfUrl = `/api/tc/${tcId}/version/${nextVersion}`;
  const { error: vError } = await supabase.from('test_certificate_versions').insert({
    plant_id: userRole.plant_id,
    tc_id: tcId,
    version_number: nextVersion,
    pdf_url: pdfUrl,
    generated_by: user.id,
    approval_status: 'prepared',
  });

  if (vError) return { error: vError.message };

  const { error: updateError } = await supabase
    .from('test_certificates')
    .update({ current_version: nextVersion, status: 'prepared' })
    .eq('id', tcId);

  if (updateError) return { error: updateError.message };

  revalidatePath('/tc');
  return { success: true, tcId, version: nextVersion, pdfUrl };
}

export async function issueTC(tcId: string) {
  const supabase = createClient();
  const { data: tc } = await supabase.from('test_certificates').select('work_order_id, current_version').eq('id', tcId).single();
  if (!tc) return { error: 'Test Certificate not found' };

  const { data: results } = await supabase
    .from('lab_results')
    .select('lab_result_parameters(validation_status)')
    .eq('work_order_id', tc.work_order_id)
    .single();

  if (!results) return { error: 'No lab results found for this work order' };
  const hasFailures = results.lab_result_parameters?.some((p: any) => p.validation_status === 'failed');
  if (hasFailures) return { error: 'Cannot issue TC with failed parameters' };

  const { error } = await supabase.from('test_certificates').update({ status: 'issued' }).eq('id', tcId);
  if (error) return { error: error.message };

  await supabase
    .from('test_certificate_versions')
    .update({ approval_status: 'issued' })
    .eq('tc_id', tcId)
    .eq('version_number', tc.current_version);

  revalidatePath('/tc');
  return { success: true };
}
