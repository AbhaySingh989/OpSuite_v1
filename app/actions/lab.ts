'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type LabResultInsert = Database['public']['Tables']['lab_results']['Insert'];
type LabParamInsert = Database['public']['Tables']['lab_result_parameters']['Insert'];

export async function initializeLabResult(woId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return { error: 'No plant assigned' };

  const { data: existing } = await supabase.from('lab_results').select('id').eq('work_order_id', woId).single();
  if (existing) return { id: existing.id };

  const { data: header, error: headerError } = await supabase.from('lab_results').insert({
    plant_id: userRole.plant_id,
    work_order_id: woId,
    validation_status: 'pending',
    tested_by: user.id,
    tested_at: new Date().toISOString(),
  }).select().single();

  if (headerError) return { error: headerError.message };

  const { data: standards } = await supabase.from('standards').select('id').limit(1);
  if (!standards || standards.length === 0) return { error: 'No standards defined' };
  const standardId = standards[0].id;

  const { data: params } = await supabase.from('standard_parameters').select('*').eq('standard_id', standardId);

  if (params) {
    const paramInserts = params.map(p => ({
      plant_id: userRole.plant_id,
      lab_result_id: header.id,
      parameter_id: p.id,
      observed_value: 0,
      validation_status: 'pending',
    }));

    await supabase.from('lab_result_parameters').insert(paramInserts as any);
  }

  return { id: header.id };
}

export async function submitLabResult(resultId: string, updates: { paramId: string, value: number }[]) {
  const supabase = createClient();

  for (const update of updates) {
    const { data: param } = await supabase
        .from('lab_result_parameters')
        .select('*, standard_parameters(min_value, max_value)')
        .eq('id', update.paramId)
        .single();

    if (param && param.standard_parameters) {
        const min = param.standard_parameters.min_value ?? -Infinity;
        const max = param.standard_parameters.max_value ?? Infinity;
        const status = (update.value >= min && update.value <= max) ? 'passed' : 'failed';

        await supabase.from('lab_result_parameters').update({
            observed_value: update.value,
            validation_status: status,
            validated_at: new Date().toISOString()
        }).eq('id', update.paramId);
    }
  }

  revalidatePath('/dashboard/lab-results');
  return { success: true, error: null };
}

export async function overrideParam(paramId: string, reason: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();

  const { error } = await supabase.from('lab_result_parameters').update({
    validation_status: 'override',
    override_flag: true,
    override_reason: reason
  }).eq('id', paramId);

  if (error) return { error: error.message };

  await supabase.from('override_logs').insert({
    plant_id: userRole!.plant_id,
    table_name: 'lab_result_parameters',
    record_id: paramId,
    reason: reason,
    performed_by: user.id
  });

  revalidatePath('/dashboard/lab-results');
  return { success: true };
}
