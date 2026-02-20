'use server';

import { createClient } from '@/utils/supabase/server';
import { UserList } from '@/components/UserList';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: users } = await supabase.from('users').select('*');
  const { data: plants } = await supabase.from('plants').select('id, name');
  const { data: userRoles } = await supabase.from('user_roles').select('user_id, role_id, plant_id');
  const { data: roles } = await supabase.from('roles').select('id, name');

  const roleById = new Map((roles || []).map((role) => [role.id, role.name]));
  const plantById = new Map((plants || []).map((plant) => [plant.id, plant.name]));
  const assignments = new Map<string, { roles: string[]; plants: string[] }>();

  for (const ur of userRoles || []) {
    const current = assignments.get(ur.user_id) || { roles: [], plants: [] };
    const roleName = roleById.get(ur.role_id);
    const plantName = plantById.get(ur.plant_id);
    if (roleName && !current.roles.includes(roleName)) current.roles.push(roleName);
    if (plantName && !current.plants.includes(plantName)) current.plants.push(plantName);
    assignments.set(ur.user_id, current);
  }

  return (
    <UserList
      initialUsers={users || []}
      plants={plants || []}
      assignments={Object.fromEntries(assignments)}
    />
  );
}
