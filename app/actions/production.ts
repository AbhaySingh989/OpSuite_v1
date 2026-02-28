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

  // RLS will handle plant_id checks ideally, but we rely on the session.
  // We process updates sequentially or in parallel.

  if (updates.length === 0) return { success: true };

  // Fetch only necessary NOT NULL columns (e.g., plant_id) for the upsert payload to satisfy constraints and RLS
  const { data: existingWOs, error: fetchError } = await supabase
    .from('work_orders')
    .select('*')
    .in(
      'id',
      updates.map((u) => u.wo_id)
    );

  if (fetchError || !existingWOs) {
    return { error: 'Failed to fetch existing work orders for update' };
  }

  // Construct upsert data containing only the primary key, required constraints, and modified columns
  const upsertData: any[] = [];
  const missingWOs: string[] = [];

  for (const update of updates) {
    const existing = existingWOs.find((wo) => wo.id === update.wo_id);
    if (!existing) {
      missingWOs.push(update.wo_id);
      continue;
    }

    upsertData.push({
      ...existing,
      status: update.status as any,
      produced_quantity: update.produced_qty,
      rejected_quantity: update.rejection_qty,
    });
  }

  if (missingWOs.length > 0) {
    return { error: 'Some work orders were not found: ' + missingWOs.join(', ') };
  }

  const { error: upsertError } = await supabase
    .from('work_orders')
    .upsert(upsertData, { onConflict: 'id' });

  if (upsertError) {
    return { error: 'Some updates failed: ' + upsertError.message };
  }

  revalidatePath('/dashboard/production-entry');
  revalidatePath('/dashboard/work-orders');
  return { success: true };
}
