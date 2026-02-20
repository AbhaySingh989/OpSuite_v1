import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@/utils/supabase/server';
import { TCDocument, type TCParameterRow } from '@/components/pdf/TCDocument';
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
    .select('id, work_order_id')
    .eq('id', params.tcId)
    .single();

  if (!tc) {
    return NextResponse.json({ error: 'TC not found' }, { status: 404 });
  }

  const { data: versionRow } = await supabase
    .from('test_certificate_versions')
    .select('version_number, generated_at')
    .eq('tc_id', params.tcId)
    .eq('version_number', version)
    .single();

  if (!versionRow) {
    return NextResponse.json({ error: 'TC version not found' }, { status: 404 });
  }

  const { data: wo } = await supabase
    .from('work_orders')
    .select('wo_number, po_id')
    .eq('id', tc.work_order_id)
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
    .select('id')
    .eq('work_order_id', tc.work_order_id)
    .single();

  let parameters: TCParameterRow[] = [];
  if (lab?.id) {
    const { data: paramsRows } = await supabase
      .from('lab_result_parameters')
      .select('observed_value, validation_status, standard_parameters(parameter_name, unit, min_value, max_value)')
      .eq('lab_result_id', lab.id);

    parameters =
      (paramsRows || []).map((row: any) => ({
        parameterName: row.standard_parameters?.parameter_name || 'Parameter',
        unit: row.standard_parameters?.unit || null,
        minValue: row.standard_parameters?.min_value ?? null,
        maxValue: row.standard_parameters?.max_value ?? null,
        observedValue: row.observed_value,
        validationStatus: row.validation_status,
      })) || [];
  }

  const pdfDoc = TCDocument({
    tcId: params.tcId,
    version,
    woNumber: wo?.wo_number || '-',
    poNumber: po?.po_number || null,
    customerName: customer?.name || null,
    generatedAt: versionRow.generated_at || new Date().toISOString(),
    parameters,
  }) as unknown as ReactElement<DocumentProps>;

  const pdfBuffer = await renderToBuffer(pdfDoc);

  return new NextResponse(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=\"tc-${params.tcId}-v${version}.pdf\"`,
      'Cache-Control': 'no-store',
    },
  });
}
