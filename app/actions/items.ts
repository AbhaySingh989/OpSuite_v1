'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

export async function getItems() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Unauthorized getItems request: missing user session');
    return [];
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  return data;
}

export async function createItem(formData: ItemInsert) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  const { error } = await supabase.from('items').insert(formData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/items');
  return { success: true };
}

export async function updateItem(id: string, formData: ItemUpdate) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  const { error } = await supabase
    .from('items')
    .update(formData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/items');
  return { success: true };
}

export async function deleteItem(id: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  const { error } = await supabase.from('items').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/items');
  return { success: true };
}
