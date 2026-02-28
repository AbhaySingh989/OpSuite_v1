import { describe, it, expect, vi, beforeEach } from 'vitest';
import { issueTC } from '../app/actions/tc';

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

describe('TC Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block unauthenticated requests to issueTC', async () => {
    // Simulate unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });

    const result = await issueTC('wo-123', '3.1');
    expect(result.error).toBe('Unauthorized');
  });

  it('should block authenticated users without qa or admin roles', async () => {
    // Simulate authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    // Simulate user with non-qa role (e.g., 'operator')
    mockSupabase.from.mockImplementation((table) => {
      const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() };
      if (table === 'user_roles') {
        chain.single.mockResolvedValue({ data: { plant_id: 'p1', roles: { name: 'operator' } } });
      } else {
        chain.single.mockResolvedValue({ data: null });
      }
      return chain;
    });

    const result = await issueTC('wo-123', '3.1');
    expect(result.error).toBe('Only QA or admin can issue TCs');
  });
});
