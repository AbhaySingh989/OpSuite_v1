'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function assignRole(userId: string, roleName: 'admin' | 'qa' | 'store', plantId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: actorRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id);
  const isAdmin = (actorRoles || []).some((r: any) => r.roles?.name === 'admin');
  if (!isAdmin) return { error: 'Only admin users can assign roles' };

  // 1. Get Role ID
  const { data: role } = await supabase.from('roles').select('id').eq('name', roleName).single();
  if (!role) return { error: 'Role not found' };

  // 2. Validate Plant
  const { data: plant } = await supabase.from('plants').select('id').eq('id', plantId).single();
  if (!plant) return { error: 'Plant not found' };

  // 3. Upsert User Role
  const { error } = await supabase.from('user_roles').upsert({
    user_id: userId,
    role_id: role.id,
    plant_id: plant.id,
  }, { onConflict: 'user_id, role_id, plant_id' });

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}
