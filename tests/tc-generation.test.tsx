import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTCData } from '../app/actions/tc';

// Hoisted mocks
const { mockSupabase } = vi.hoisted(() => {
  const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis()
  };

  return {
    mockSupabase: {
      from: vi.fn(() => chain),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(),
          getPublicUrl: vi.fn()
        }))
      },
      auth: {
        getUser: vi.fn()
      }
    }
  }
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => mockSupabase
}));

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('pdf-content')),
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  StyleSheet: { create: () => ({}) },
  Font: { register: () => {} }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('TC Generation Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default Auth Mock
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    // Default User Role Mock
    // We need to implement .from() to return specific data based on table name
    mockSupabase.from.mockImplementation((table) => {
       const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          order: vi.fn(),
          insert: vi.fn(),
          update: vi.fn()
      };

      // Default fallback
      chain.single.mockResolvedValue({ data: null });
      chain.order.mockResolvedValue({ data: [] });

      return chain;
    });
  });

  it('should block TC generation if WO is not completed', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(), order: vi.fn(), insert: vi.fn(), update: vi.fn() };

      if (table === 'user_roles') chain.single.mockResolvedValue({ data: { plant_id: 'p1', roles: { name: 'qa' } } });
      else if (table === 'work_orders') chain.single.mockResolvedValue({ data: { status: 'in_production' } });
      else chain.single.mockResolvedValue({ data: null });

      return chain;
    });

    const result = await getTCData('wo-123', '3.1');
    expect(result.error).toContain('Work Order is not completed');
  });

  it('should block TC generation if lab results have failures without override', async () => {
     const mockWO = { status: 'completed', wo_number: 'WO-1', purchase_orders: { customers: { name: 'Cust' } } };
     const mockLab = {
        lab_result_parameters: [
           { validation_status: 'failed', override_flag: false, standard_parameters: { parameter_name: 'Carbon' } }
        ]
     };

     mockSupabase.from.mockImplementation((table) => {
        const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(), order: vi.fn(), insert: vi.fn(), update: vi.fn() };
        if (table === 'user_roles') chain.single.mockResolvedValue({ data: { plant_id: 'p1', roles: { name: 'qa' } } });
        if (table === 'work_orders') chain.single.mockResolvedValue({ data: mockWO });
        if (table === 'lab_results') chain.single.mockResolvedValue({ data: mockLab });
        if (table === 'users') chain.single.mockResolvedValue({ data: { full_name: 'Tester' } });
        return chain;
     });

     const result = await getTCData('wo-123', '3.1');
     expect(result.error).toContain('Lab results contain failed parameters');
  });

  it('should allow TC generation if lab results failed but have override', async () => {
      const mockWO = { status: 'completed', wo_number: 'WO-1', quantity: 100, purchase_orders: { customers: { name: 'Cust' } }, items: { item_code: 'Item1' } };
      const mockLab = {
         tested_by: 'user-1',
         lab_result_parameters: [
            { validation_status: 'failed', override_flag: true, standard_parameters: { parameter_name: 'Carbon', category: 'chemical' } }
         ]
      };
      const mockAlloc = { quantity: 100, heats: { heat_number: 'H1' } };
      const mockPlant = { name: 'Plant 1', location: 'Loc 1' };

      mockSupabase.from.mockImplementation((table) => {
         const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(), order: vi.fn(), insert: vi.fn(), update: vi.fn() };
         if (table === 'user_roles') chain.single.mockResolvedValue({ data: { plant_id: 'p1', roles: { name: 'qa' } } });
         if (table === 'work_orders') chain.single.mockResolvedValue({ data: mockWO });
         if (table === 'lab_results') chain.single.mockResolvedValue({ data: mockLab });
         if (table === 'inventory_movements') chain.single.mockResolvedValue({ data: mockAlloc });
         if (table === 'plants') chain.single.mockResolvedValue({ data: mockPlant });
         if (table === 'test_certificates') chain.single.mockResolvedValue({ data: null });
         if (table === 'users') chain.single.mockResolvedValue({ data: { full_name: 'Tester' } });
         return chain;
      });

      const result = await getTCData('wo-123', '3.1');
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.parameters[0].validation_status).toBe('failed');
   });

   it('should increment version if TC already exists', async () => {
      const mockWO = { status: 'completed', wo_number: 'WO-1', quantity: 100 };
      const mockLab = { tested_by: 'u1', lab_result_parameters: [] };
      const mockAlloc = { heats: {} };
      const mockPlant = { name: 'P1' };
      const existingTC = { current_version: 2, id: 'tc-1' };

      mockSupabase.from.mockImplementation((table) => {
        const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(), order: vi.fn(), insert: vi.fn(), update: vi.fn() };
        if (table === 'user_roles') chain.single.mockResolvedValue({ data: { plant_id: 'p1', roles: { name: 'qa' } } });
        if (table === 'work_orders') chain.single.mockResolvedValue({ data: mockWO });
        if (table === 'lab_results') chain.single.mockResolvedValue({ data: mockLab });
        if (table === 'inventory_movements') chain.single.mockResolvedValue({ data: mockAlloc });
        if (table === 'plants') chain.single.mockResolvedValue({ data: mockPlant });
        if (table === 'test_certificates') chain.single.mockResolvedValue({ data: existingTC });
        if (table === 'users') chain.single.mockResolvedValue({ data: { full_name: 'Tester' } });
        return chain;
      });

      const result = await getTCData('wo-123', '3.1');
      expect(result.data?.version).toBe(3);
   });
});
