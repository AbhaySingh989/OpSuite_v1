'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function assignRole(userId: string, roleName: 'admin' | 'qa' | 'store', plantName: string) {
  const supabase = createClient();

  // 1. Get Role ID
  const { data: role } = await supabase.from('roles').select('id').eq('name', roleName).single();
  if (!role) return { error: 'Role not found' };

  // 2. Get Plant ID
  const { data: plant } = await supabase.from('plants').select('id').eq('name', plantName).single();
  if (!plant) return { error: 'Plant not found' };

  // 3. Upsert User Role
  const { error } = await supabase.from('user_roles').upsert({
    user_id: userId,
    role_id: role.id,
    plant_id: plant.id
  }, { onConflict: 'user_id, role_id, plant_id' });

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}
