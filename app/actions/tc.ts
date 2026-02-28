'use server';

import { createClient } from '@/utils/supabase/server';
import { TCData } from '@/components/pdf/TCDocument';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import TCDocument from '@/components/pdf/TCDocument';
import { revalidatePath } from 'next/cache';
import type { ReactElement } from 'react';

// Helper to get authenticated client and plant_id
async function getAuthContext() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('plant_id, role_id, roles(name)')
    .eq('user_id', user.id)
    .single();

  if (roleError || !userRole) throw new Error('No plant assigned or role found');

  return { supabase, user, userRole };
}

export async function getCompletedWorkOrders() {
  const authClient = createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return { data: [] };

  try {
    const { supabase, userRole } = await getAuthContext();

    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        wo_number,
        quantity,
        status,
        items (item_code, description),
        purchase_orders (po_number, customers (name))
      `)
      .eq('plant_id', userRole.plant_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { data };
  } catch (e: any) {
    if (e.message === 'Unauthorized' || e.message === 'No plant assigned or role found') {
      return { data: [] };
    }
    return { error: e.message };
  }
}

export async function getTCData(woId: string, tcType: string): Promise<{ data?: TCData, error?: string }> {
   try {
    const { supabase, userRole, user } = await getAuthContext();

    // 1. Fetch Work Order Details
    const { data: wo, error: woError } = await supabase
      .from('work_orders')
      .select(`
        *,
        items (*),
        purchase_orders (
          *,
          customers (*)
        )
      `)
      .eq('id', woId)
      .single();

    if (woError || !wo) throw new Error('Work order not found');
    if (wo.status !== 'completed') throw new Error('Work Order is not completed');

    // 2. Fetch Lab Results
    const { data: labResult, error: labError } = await supabase
      .from('lab_results')
      .select(`
        *,
        lab_result_parameters (
          *,
          standard_parameters (*)
        )
      `)
      .eq('work_order_id', woId)
      .single();

    if (labError || !labResult) throw new Error('No lab results found');

    // Fetch tester name
    let testerName = 'System';
    if (labResult.tested_by) {
      const { data: tester } = await supabase.from('users').select('full_name').eq('id', labResult.tested_by).single();
      if (tester) testerName = tester.full_name || 'System';
    }

    // Validation: Check for failed parameters
    const failedParams = labResult.lab_result_parameters.filter((p: any) =>
      p.validation_status === 'failed' && !p.override_flag
    );

    if (failedParams.length > 0) {
      throw new Error(`Lab results contain failed parameters: ${failedParams.map((p: any) => p.standard_parameters.parameter_name).join(', ')}`);
    }

    // 3. Fetch Heat Allocation (Inventory Movement)
    const { data: allocation, error: allocError } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        heats (*)
      `)
      .eq('work_order_id', woId)
      .eq('movement_type', 'allocation')
      .single();

    if (allocError || !allocation) throw new Error('No heat allocation found for this Work Order');

    // 4. Fetch Plant Details
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', userRole.plant_id)
      .single();

    if (plantError) throw new Error('Plant details not found');

    // 5. Check for existing TC to determine version
    const { data: existingTC } = await supabase
      .from('test_certificates')
      .select('*')
      .eq('work_order_id', woId)
      .single();

    const version = existingTC ? existingTC.current_version + 1 : 1;
    const tcNumber = existingTC ? `TC-${wo.wo_number}` : `TC-${wo.wo_number}`;

    // Fetch current user details for approval
    const { data: currentUser } = await supabase.from('users').select('full_name').eq('id', user.id).single();

    // Construct TCData
    const tcData: TCData = {
      tc_number: tcNumber,
      version: version,
      tc_type: tcType,
      issue_date: new Date().toLocaleDateString(),
      plant_name: plant.name,
      plant_location: plant.location,
      customer_name: wo.purchase_orders?.customers?.name || null,
      po_number: wo.purchase_orders?.po_number || '',
      wo_number: wo.wo_number,
      item_code: wo.items?.item_code || '',
      item_description: wo.items?.description || null,
      quantity: wo.quantity,
      dispatch_date: null,
      heat_number: allocation.heats?.heat_number || '',
      supplier_name: allocation.heats?.supplier_name || null,
      material_grade: allocation.heats?.material_grade || null,
      allocated_quantity: allocation.quantity,
      parameters: labResult.lab_result_parameters.map((p: any) => ({
        parameter_name: p.standard_parameters.parameter_name,
        category: p.standard_parameters.category,
        unit: p.standard_parameters.unit,
        min_value: p.standard_parameters.min_value,
        max_value: p.standard_parameters.max_value,
        observed_value: p.observed_value,
        validation_status: p.validation_status
      })),
      prepared_by_name: testerName,
      approved_by_name: currentUser?.full_name || 'Pending'
    };

    return { data: tcData };

   } catch (e: any) {
     return { error: e.message };
   }
}

export async function generateTCPreview(woId: string, tcType: string) {
  try {
    const { data, error } = await getTCData(woId, tcType);
    if (error || !data) throw new Error(error || 'Failed to fetch data');

    // Render PDF to Buffer
    const pdfDoc = TCDocument({ data }) as unknown as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(pdfDoc);
    const base64 = buffer.toString('base64');

    return { pdfBase64: base64 };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Backward-compatible action used by the existing dashboard.
export async function generateTC(woId: string) {
  return generateTCPreview(woId, '3.1');
}

export async function issueTC(id: string, tcType: string = '3.1') {
  try {
    const { supabase, userRole, user } = await getAuthContext();

    // Security check: Only QA
    const rolesRaw = userRole.roles as unknown;
    let roleName: string | undefined;
    if (Array.isArray(rolesRaw)) {
      const firstRole = rolesRaw[0] as { name?: string } | undefined;
      roleName = firstRole?.name;
    } else if (rolesRaw && typeof rolesRaw === 'object') {
      roleName = (rolesRaw as { name?: string }).name;
    }
    if (roleName !== 'qa' && roleName !== 'admin') {
      return { error: 'Only QA or admin can issue TCs' };
    }

    let woId = id;
    const { data: woById } = await supabase.from('work_orders').select('id').eq('id', id).single();
    if (!woById) {
      const { data: tcById } = await supabase
        .from('test_certificates')
        .select('work_order_id, tc_type')
        .eq('id', id)
        .single();

      if (!tcById?.work_order_id) {
        throw new Error('Work order or Test Certificate not found');
      }

      woId = tcById.work_order_id;
      tcType = tcById.tc_type || tcType;
    }

    const { data, error } = await getTCData(woId, tcType);
    if (error || !data) throw new Error(error || 'Failed to fetch data');

    // Render PDF
    const pdfDoc = TCDocument({ data }) as unknown as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(pdfDoc);

    // Upload to Storage
    const fileName = `tc-${data.tc_number}-v${data.version}.pdf`;
    const filePath = `${userRole.plant_id}/${fileName}`; // Plant isolated path

    const { error: uploadError } = await supabase.storage
      .from('test-certificates') // Assume bucket exists
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage.from('test-certificates').getPublicUrl(filePath);
    const pdfUrl = publicUrlData.publicUrl;

    // Database Transactions
    // 1. Ensure TC Header Exists
    let tcId: string;
    const { data: existingTC } = await supabase
      .from('test_certificates')
      .select('id')
      .eq('work_order_id', woId)
      .single();

    if (existingTC) {
      tcId = existingTC.id;
      // Update header
      await supabase
        .from('test_certificates')
        .update({
            current_version: data.version,
            status: 'issued',
            tc_type: tcType
        })
        .eq('id', tcId);
    } else {
      // Create header
      const { data: newTC, error: insertError } = await supabase
        .from('test_certificates')
        .insert({
          plant_id: userRole.plant_id,
          work_order_id: woId,
          current_version: data.version,
          status: 'issued',
          tc_type: tcType
        })
        .select()
        .single();

      if (insertError || !newTC) throw new Error(insertError?.message || 'Failed to create TC header');
      tcId = newTC.id;
    }

    // 2. Create Version Entry
    const { error: versionError } = await supabase
      .from('test_certificate_versions')
      .insert({
        plant_id: userRole.plant_id,
        tc_id: tcId,
        version_number: data.version,
        pdf_url: pdfUrl,
        generated_by: user.id,
        approval_status: 'issued', // Auto-approved on issue? Prompt says "QA approves. QA issues."
        approved_by: user.id,
        approved_at: new Date().toISOString()
      });

    if (versionError) throw new Error(versionError.message);

    revalidatePath('/tc');
    return { success: true };

  } catch (e: any) {
    return { error: e.message };
  }
}
