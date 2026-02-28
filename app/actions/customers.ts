'use server';

import { Database } from '@/types/database.types';
import { createCRUDActions } from '@/utils/supabase/crud';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

const customerActions = createCRUDActions<CustomerInsert, CustomerUpdate>(
  'customers',
  '/dashboard/master-data/customers'
);

export const getCustomers = customerActions.getAll;
export const createCustomer = customerActions.create;
export const updateCustomer = customerActions.update;
export const deleteCustomer = customerActions.remove;
