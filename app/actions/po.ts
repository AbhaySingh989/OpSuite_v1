'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type PO = Database['public']['Tables']['purchase_orders']['Row'];
type POInsert = Database['public']['Tables']['purchase_orders']['Insert'];

export async function getPOs() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, customers(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching POs:', error);
    return [];
  }

  return data;
}

export async function createPO(formData: POInsert) {
  const supabase = createClient();

  // Helper function for RLS ensures plant_id is set?
  // User should pass plant_id or we get it from session?
  // User role table has plant_id. We should fetch it.

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Fetch user's plant (assuming single plant for now as per dashboard)
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('plant_id')
    .eq('user_id', user.id)
    .single();

  if (!userRole) return { error: 'No plant assigned' };

  const { error } = await supabase.from('purchase_orders').insert({
    ...formData,
    plant_id: userRole.plant_id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/po');
  return { success: true };
}
