'use server';

import { getProductionWOs } from '@/app/actions/production';
import { ProductionEntry } from '@/components/ProductionEntry';

export default async function ProductionEntryPage() {
  const wos = await getProductionWOs();

  return <ProductionEntry initialWOs={wos || []} />;
}
