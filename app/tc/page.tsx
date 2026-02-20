'use server';

import { createClient } from '@/utils/supabase/server';
import { TCDashboard } from '@/components/TCDashboard';

export default async function TCPage() {
  const supabase = createClient();
  const { data: tcs } = await supabase
    .from('test_certificates')
    .select('id, work_order_id, current_version, status, created_at')
    .order('created_at', { ascending: false });

  const woIds = [...new Set((tcs || []).map((tc) => tc.work_order_id).filter(Boolean))];
  const tcIds = [...new Set((tcs || []).map((tc) => tc.id))];

  const { data: wos } = woIds.length
    ? await supabase.from('work_orders').select('id, wo_number, po_id').in('id', woIds)
    : { data: [] as any[] };
  const woById = new Map((wos || []).map((wo) => [wo.id, wo]));

  const poIds = [...new Set((wos || []).map((wo) => wo.po_id).filter(Boolean))];
  const { data: pos } = poIds.length
    ? await supabase.from('purchase_orders').select('id, po_number, customer_id').in('id', poIds)
    : { data: [] as any[] };
  const poById = new Map((pos || []).map((po) => [po.id, po]));

  const customerIds = [...new Set((pos || []).map((po) => po.customer_id).filter(Boolean))];
  const { data: customers } = customerIds.length
    ? await supabase.from('customers').select('id, name').in('id', customerIds)
    : { data: [] as any[] };
  const customerById = new Map((customers || []).map((customer) => [customer.id, customer]));

  const { data: versions } = tcIds.length
    ? await supabase
        .from('test_certificate_versions')
        .select('tc_id, version_number, pdf_url')
        .in('tc_id', tcIds)
    : { data: [] as any[] };
  const versionMap = new Map((versions || []).map((version) => [`${version.tc_id}:${version.version_number}`, version]));

  const tcRows = (tcs || []).map((tc) => {
    const wo = woById.get(tc.work_order_id);
    const po = wo?.po_id ? poById.get(wo.po_id) : undefined;
    const customer = po?.customer_id ? customerById.get(po.customer_id) : undefined;
    const version = versionMap.get(`${tc.id}:${tc.current_version}`);

    return {
      id: tc.id,
      status: tc.status,
      current_version: tc.current_version,
      wo_number: wo?.wo_number || '-',
      customer_name: customer?.name || '-',
      pdf_url: version?.pdf_url || null,
    };
  });

  const { data: woOptions } = await supabase
    .from('work_orders')
    .select('id, wo_number, status')
    .in('status', ['lab_pending', 'completed', 'in_production'])
    .order('created_at', { ascending: false });

  return <TCDashboard initialTCs={tcRows} availableWOs={woOptions || []} />;
}
