'use server';

import { createClient } from '@/utils/supabase/server';
import { UserList } from '@/components/UserList';

export default async function UsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase.from('users').select('*');
  const { data: plants } = await supabase.from('plants').select('name');

  return (
    <UserList initialUsers={users || []} plantNames={plants?.map(p => p.name) || []} />
  );
}
