'use server';

import { createClient } from '@/utils/supabase/server';
import { TCDashboard } from '@/components/TCDashboard';

export default async function TCPage() {
  const supabase = createClient();

  // Optimized query: Fetch TCs with all necessary related data in one go
  const { data: tcs } = await supabase
    .from('test_certificates')
    .select(`
      id,
      status,
      current_version,
      work_order_id,
      created_at,
      work_orders (
        id,
        wo_number,
        po_id,
        purchase_orders (
          id,
          po_number,
          customer_id,
          customers (
            id,
            name
          )
        )
      ),
      test_certificate_versions (
        tc_id,
        version_number,
        pdf_url
      )
    `)
    .order('created_at', { ascending: false });

  const tcRows = (tcs || []).map((tc: any) => {
    // In Supabase joins, 'belongs_to' relations (like work_orders here) are returned as single objects (or null).
    // 'has_many' relations (like test_certificate_versions) are returned as arrays.
    const wo = tc.work_orders;
    const po = wo?.purchase_orders;
    const customer = po?.customers;

    const versions = Array.isArray(tc.test_certificate_versions) ? tc.test_certificate_versions : [];
    const version = versions.find((v: any) => v.version_number === tc.current_version);

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
