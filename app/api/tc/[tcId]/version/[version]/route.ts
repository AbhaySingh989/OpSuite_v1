import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@/utils/supabase/server';
import { TCDocument, type TCData, type TCParameter } from '@/components/pdf/TCDocument';
import type { ReactElement } from 'react';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: { tcId: string; version: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const version = Number(params.version);
  if (!Number.isFinite(version) || version <= 0) {
    return NextResponse.json({ error: 'Invalid version' }, { status: 400 });
  }

  const { data: tc } = await supabase
    .from('test_certificates')
    .select('id, work_order_id, tc_type, plant_id')
    .eq('id', params.tcId)
    .single();

  if (!tc || !tc.work_order_id) {
    return NextResponse.json({ error: 'TC not found' }, { status: 404 });
  }

  const { data: versionRow } = await supabase
    .from('test_certificate_versions')
    .select('version_number, generated_at, generated_by, approved_by')
    .eq('tc_id', params.tcId)
    .eq('version_number', version)
    .single();

  if (!versionRow) {
    return NextResponse.json({ error: 'TC version not found' }, { status: 404 });
  }

  const { data: wo } = await supabase
    .from('work_orders')
    .select('wo_number, po_id, item_id, quantity')
    .eq('id', tc.work_order_id)
    .single();

  const { data: item } = await supabase
    .from('items')
    .select('item_code, description')
    .eq('id', wo?.item_id || '')
    .single();

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('po_number, customer_id')
    .eq('id', wo?.po_id || '')
    .single();

  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', po?.customer_id || '')
    .single();

  const { data: lab } = await supabase
    .from('lab_results')
    .select('id, tested_by')
    .eq('work_order_id', tc.work_order_id)
    .single();

  let parameters: TCParameter[] = [];
  if (lab?.id) {
    const { data: paramsRows } = await supabase
      .from('lab_result_parameters')
      .select('observed_value, validation_status, standard_parameters(parameter_name, category, unit, min_value, max_value)')
      .eq('lab_result_id', lab.id);

    parameters =
      (paramsRows || []).map((row: any) => ({
        parameter_name: row.standard_parameters?.parameter_name || 'Parameter',
        category:
          row.standard_parameters?.category === 'mechanical' || row.standard_parameters?.category === 'dimensional'
            ? row.standard_parameters.category
            : 'chemical',
        unit: row.standard_parameters?.unit || null,
        min_value: row.standard_parameters?.min_value ?? null,
        max_value: row.standard_parameters?.max_value ?? null,
        observed_value: row.observed_value,
        validation_status: row.validation_status,
      })) || [];
  }

  const { data: allocation } = await supabase
    .from('inventory_movements')
    .select('quantity, heat_id')
    .eq('work_order_id', tc.work_order_id)
    .eq('movement_type', 'allocation')
    .single();

  const { data: heat } = await supabase
    .from('heats')
    .select('heat_number, supplier_name, material_grade')
    .eq('id', allocation?.heat_id || '')
    .single();

  const { data: plant } = await supabase
    .from('plants')
    .select('name, location')
    .eq('id', tc.plant_id)
    .single();

  const userIds = [lab?.tested_by, versionRow?.approved_by].filter(Boolean);
  const { data: users } = userIds.length
    ? await supabase.from('users').select('id, full_name').in('id', userIds as string[])
    : { data: [] as { id: string; full_name: string | null }[] };
  const userById = new Map((users || []).map((u) => [u.id, u.full_name]));

  const tcData: TCData = {
    tc_number: `TC-${wo?.wo_number || params.tcId}`,
    version,
    tc_type: tc.tc_type || '3.1',
    issue_date: new Date(versionRow.generated_at || new Date().toISOString()).toLocaleDateString(),
    plant_name: plant?.name || 'Plant',
    plant_location: plant?.location || null,
    customer_name: customer?.name || null,
    po_number: po?.po_number || '',
    wo_number: wo?.wo_number || '-',
    item_code: item?.item_code || '',
    item_description: item?.description || null,
    quantity: wo?.quantity ?? null,
    dispatch_date: null,
    heat_number: heat?.heat_number || '',
    supplier_name: heat?.supplier_name || null,
    material_grade: heat?.material_grade || null,
    allocated_quantity: allocation?.quantity ?? 0,
    parameters,
    prepared_by_name: (lab?.tested_by && userById.get(lab.tested_by)) || 'System',
    approved_by_name: (versionRow.approved_by && userById.get(versionRow.approved_by)) || 'Pending',
  };

  const pdfDoc = TCDocument({ data: tcData }) as unknown as ReactElement<DocumentProps>;

  const pdfBuffer = await renderToBuffer(pdfDoc);

  return new NextResponse(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=\"tc-${params.tcId}-v${version}.pdf\"`,
      'Cache-Control': 'no-store',
    },
  });
}
