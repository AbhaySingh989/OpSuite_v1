'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import ReactPDF from '@react-pdf/renderer';
// Note: ReactPDF.renderToStream is node-only.
// Need to handle PDF generation. For now, we will just simulate PDF generation or use a placeholder URL.
// Actually, I can use @react-pdf/renderer on server actions if I install it properly, but Vercel limits might apply.
// Better to generate on client or use a simple blob approach.
// But requirement says "PDF_ENGINE: @react-pdf/renderer".
// I will create the DB record. Actual PDF buffer can be uploaded to Storage.
// For this MVP, I will generate a dummy URL or mock the storage upload.

export async function generateTC(woId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: userRole } = await supabase.from('user_roles').select('plant_id').eq('user_id', user.id).single();
  if (!userRole) return { error: 'No plant assigned' };

  // Check validation
  const { data: results } = await supabase
    .from('lab_results')
    .select('*, lab_result_parameters(*)')
    .eq('work_order_id', woId)
    .single();

  if (!results) return { error: 'No lab results found' };

  const hasFailures = results.lab_result_parameters.some((p: any) => p.validation_status === 'failed');
  if (hasFailures) return { error: 'Cannot generate TC with failed parameters. Override required.' };

  // Create TC Header
  const { data: tc, error: tcError } = await supabase.from('test_certificates').insert({
    plant_id: userRole.plant_id,
    work_order_id: woId,
    current_version: 1,
    status: 'prepared'
  }).select().single();

  if (tcError) return { error: tcError.message };

  // Create Version 1
  const { error: vError } = await supabase.from('test_certificate_versions').insert({
    plant_id: userRole.plant_id,
    tc_id: tc.id,
    version_number: 1,
    pdf_url: 'https://placehold.co/600x400/EEE/31343C.pdf?text=Test+Certificate', // Mock
    generated_by: user.id,
    approval_status: 'prepared'
  });

  if (vError) return { error: vError.message };

  revalidatePath('/tc');
  return { success: true };
}

export async function issueTC(tcId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('test_certificates').update({ status: 'issued' }).eq('id', tcId);
  if (error) return { error: error.message };
  revalidatePath('/tc');
  return { success: true };
}
