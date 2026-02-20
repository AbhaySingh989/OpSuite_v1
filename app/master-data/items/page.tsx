'use server';

import { createClient } from '@/utils/supabase/server';
import { ItemList } from '@/components/ItemList';

export default async function ItemsPage() {
  const supabase = createClient();
  const { data: items } = await supabase.from('items').select('*').order('created_at', { ascending: false });

  return (
    <ItemList initialItems={items || []} />
  );
}
