import { describe, it, expect, vi } from 'vitest';
import { updateProduction, ProductionUpdate } from '../app/actions/production';

// Mock Supabase client
const mockIn = vi.fn().mockResolvedValue({
  data: Array.from({ length: 100 }, (_, i) => ({
    id: `wo-${i}`,
    plant_id: 'p1',
    wo_number: `wo-num-${i}`,
    status: 'in_production',
    created_at: '2024-01-01',
    is_deleted: false,
    po_id: '123',
    item_id: '456',
    quantity: 500,
    created_by: 'user1',
    updated_at: null,
    updated_by: null
  })),
  error: null
});

const mockSelect = vi.fn().mockReturnValue({ in: mockIn });

const mockUpsert = vi.fn().mockResolvedValue({ error: null });

const mockFrom = vi.fn().mockImplementation((table) => {
  return {
    select: mockSelect,
    upsert: mockUpsert,
  };
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updateProduction Benchmark Optimized', () => {
  it('measures time to update 100 items', async () => {
    const updates: ProductionUpdate[] = Array.from({ length: 100 }, (_, i) => ({
      wo_id: `wo-${i}`,
      produced_qty: 100,
      rejection_qty: 0,
      status: 'completed',
    }));

    const start = performance.now();
    const result = await updateProduction(updates);
    const end = performance.now();

    expect(result).toEqual({ success: true });

    const duration = end - start;
    console.log(`BENCHMARK_RESULT_OPTIMIZED: ${duration.toFixed(2)} ms`);

    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
