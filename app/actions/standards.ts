'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type Standard = Database['public']['Tables']['standards']['Row'];
type StandardInsert = Database['public']['Tables']['standards']['Insert'];
type Parameter = Database['public']['Tables']['standard_parameters']['Row'];
type ParameterInsert = Database['public']['Tables']['standard_parameters']['Insert'];

export async function getStandards() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('standards')
    .select('*, standard_parameters(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching standards:', error);
    return [];
  }

  return data;
}

export async function createStandard(formData: StandardInsert) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please sign in again.' };
  const { data, error } = await supabase.from('standards').insert(formData).select().single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/standards');
  return { success: true, data };
}

export async function createParameter(formData: ParameterInsert) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please sign in again.' };
  const { error } = await supabase.from('standard_parameters').insert(formData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/standards');
  return { success: true };
}

export async function deleteStandard(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please sign in again.' };
  const { error } = await supabase.from('standards').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/standards');
  return { success: true };
}

export async function deleteParameter(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please sign in again.' };
  const { error } = await supabase.from('standard_parameters').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/standards');
  return { success: true };
}
