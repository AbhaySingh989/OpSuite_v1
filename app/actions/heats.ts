'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type HeatInsert = Database['public']['Tables']['heats']['Insert'];
type MovementInsert = Database['public']['Tables']['inventory_movements']['Insert'];

export async function createHeat(formData: HeatInsert) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return { error: 'No plant assigned' };

  const { error } = await supabase.from('heats').insert({
    ...formData,
    plant_id: userRole.plant_id,
    available_quantity: formData.initial_quantity, // Initial available = initial
  });

  if (error) return { error: error.message };
  revalidatePath('/inventory/heats');
  return { success: true };
}

export async function allocateHeat(heatId: string, woId: string, quantity: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return { error: 'No plant assigned' };

  // Transaction: 1. Decrease Heat Avail Qty, 2. Insert Movement
  // Supabase direct client doesn't support complex transactions easily without RPC or RLS constraints?
  // We can do sequential. If first fails, stop. If second fails, rollback?
  // Better to use RPC but for now sequential with checks.

  const { data: heat, error: fetchError } = await supabase.from('heats').select('available_quantity').eq('id', heatId).single();
  if (fetchError || !heat) return { error: 'Heat not found' };
  if ((heat.available_quantity || 0) < quantity) return { error: 'Insufficient quantity' };

  const { error: updateError } = await supabase
    .from('heats')
    .update({ available_quantity: (heat.available_quantity || 0) - quantity })
    .eq('id', heatId);

  if (updateError) return { error: updateError.message };

  const { error: moveError } = await supabase.from('inventory_movements').insert({
    plant_id: userRole.plant_id,
    heat_id: heatId,
    work_order_id: woId,
    movement_type: 'allocation',
    quantity: -quantity, // Allocation is negative movement? Or positive allocation?
    // Requirement 4.4: "Manual allocation enforced at UI level."
    // Usually allocation means reserving. Let's record positive quantity for allocation record, but it reduces stock.
    // Let's stick to positive number for "amount moved".
    movement_date: new Date().toISOString(),
  });

  if (moveError) {
    // Rollback heat update?
    await supabase.from('heats').update({ available_quantity: (heat.available_quantity || 0) }).eq('id', heatId);
    return { error: moveError.message };
  }

  revalidatePath('/inventory/heats');
  return { success: true };
}

export async function getHeats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return [];

  const { data, error } = await supabase.from('heats').select('*').eq('plant_id', userRole.plant_id).order('created_at', { ascending: false });
  if (error) return [];
  return data;
}
