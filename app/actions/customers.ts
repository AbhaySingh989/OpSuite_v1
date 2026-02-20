'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export async function getCustomers() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error('Unauthorized getCustomers request: missing user session');
    return [];
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data;
}

export async function createCustomer(formData: CustomerInsert) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  const { error } = await supabase.from('customers').insert(formData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/customers');
  return { success: true };
}

export async function updateCustomer(id: string, formData: CustomerUpdate) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  const { error } = await supabase
    .from('customers')
    .update(formData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/master-data/customers');
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized. Please sign in again.' };
  }

  // Prefer soft delete where schema supports `is_deleted`; fallback to hard delete for legacy schemas.
  const softDelete = await supabase.from('customers').update({ is_deleted: true } as any).eq('id', id);
  if (softDelete.error) {
    const missingColumn = softDelete.error.message.toLowerCase().includes('is_deleted');
    if (!missingColumn) {
      return { error: softDelete.error.message };
    }

    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath('/dashboard/master-data/customers');
  return { success: true };
}
