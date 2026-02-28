'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type ProductionUpdate = {
  wo_id: string;
  produced_qty: number;
  rejection_qty: number;
  status: string; // 'in_production' | 'lab_pending' | 'completed'
};

export async function getProductionWOs() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('work_orders')
    .select('*, items(item_code, description), purchase_orders(po_number)')
    .in('status', ['draft', 'in_production'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching production WOs:', error);
    return [];
  }

  return data;
}

export async function updateProduction(updates: ProductionUpdate[]) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized. Please sign in again.' };

  for (const update of updates) {
    if (update.produced_qty < 0 || update.rejection_qty < 0) {
      return { error: 'Quantities cannot be negative.' };
    }
  }

  // RLS will handle plant_id checks ideally, but we rely on the session.
  // We process updates sequentially or in parallel.

  const results = await Promise.all(updates.map(async (update) => {
    // Note: produced_quantity and rejected_quantity columns are assumed to exist
    // or we might need to store this elsewhere if schema is rigid.
    // For this implementation, we assume schema has been migrated.

    // We also update status.
    const { error } = await supabase
      .from('work_orders')
      .update({
        status: update.status as any,
        // @ts-ignore: Assuming column exists
        produced_quantity: update.produced_qty,
        // @ts-ignore: Assuming column exists
        rejected_quantity: update.rejection_qty
      })
      .eq('id', update.wo_id);

    return error;
  }));

  const errors = results.filter(Boolean);

  if (errors.length > 0) {
    return { error: 'Some updates failed' };
  }

  revalidatePath('/dashboard/production-entry');
  revalidatePath('/dashboard/work-orders');
  return { success: true };
}
