'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type WOInsert = Database['public']['Tables']['work_orders']['Insert'];

export async function createWO(formData: WOInsert) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('plant_id')
    .eq('user_id', user.id)
    .single();

  if (!userRole) return { error: 'No plant assigned' };

  const { error } = await supabase.from('work_orders').insert({
    ...formData,
    plant_id: userRole.plant_id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/work-orders');
  return { success: true };
}
