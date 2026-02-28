'use server';

import { Database } from '@/types/database.types';
import { createCRUDActions } from '@/utils/supabase/crud';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

const itemActions = createCRUDActions<ItemInsert, ItemUpdate>(
  'items',
  '/dashboard/master-data/items'
);

export const getItems = itemActions.getAll;
export const createItem = itemActions.create;
export const updateItem = itemActions.update;
export const deleteItem = itemActions.remove;
