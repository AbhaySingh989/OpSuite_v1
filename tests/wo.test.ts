import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWO } from '@/app/actions/wo';
import { revalidatePath } from 'next/cache';

const mocks = vi.hoisted(() => {
  const mockInsert = vi.fn();
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));

  const mockFrom = vi.fn((table: string) => {
    if (table === 'user_roles') {
      return { select: mockSelect };
    }
    if (table === 'work_orders') {
      return { insert: mockInsert };
    }
    return {};
  });

  const mockGetUser = vi.fn();

  return {
    mockInsert,
    mockSingle,
    mockEq,
    mockSelect,
    mockFrom,
    mockGetUser,
  };
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mocks.mockGetUser },
    from: mocks.mockFrom,
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('createWO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create work order successfully', async () => {
    const user = { id: 'user-123' };
    const plantId = 'plant-456';
    const formData = {
      work_order_number: 'WO-001',
      description: 'Test WO',
      status: 'Pending',
    };

    mocks.mockGetUser.mockResolvedValue({ data: { user } });
    mocks.mockSingle.mockResolvedValue({ data: { plant_id: plantId }, error: null });
    mocks.mockInsert.mockResolvedValue({ error: null });

    const result = await createWO(formData as any);

    expect(mocks.mockGetUser).toHaveBeenCalled();
    expect(mocks.mockFrom).toHaveBeenCalledWith('user_roles');
    expect(mocks.mockSelect).toHaveBeenCalledWith('plant_id');
    expect(mocks.mockEq).toHaveBeenCalledWith('user_id', user.id);
    expect(mocks.mockSingle).toHaveBeenCalled();

    expect(mocks.mockFrom).toHaveBeenCalledWith('work_orders');
    expect(mocks.mockInsert).toHaveBeenCalledWith({
      ...formData,
      plant_id: plantId,
    });

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/work-orders');
    expect(result).toEqual({ success: true });
  });

  it('should return error if unauthorized', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await createWO({} as any);

    expect(result).toEqual({ error: 'Unauthorized' });
    expect(mocks.mockFrom).not.toHaveBeenCalled();
  });

  it('should return error if no plant assigned', async () => {
    const user = { id: 'user-123' };
    mocks.mockGetUser.mockResolvedValue({ data: { user } });
    mocks.mockSingle.mockResolvedValue({ data: null, error: null });

    const result = await createWO({} as any);

    expect(result).toEqual({ error: 'No plant assigned' });
    expect(mocks.mockInsert).not.toHaveBeenCalled();
  });

  it('should return error if insertion fails', async () => {
    const user = { id: 'user-123' };
    const plantId = 'plant-456';
    const formData = {
      work_order_number: 'WO-001',
    };
    const errorMsg = 'Insertion failed';

    mocks.mockGetUser.mockResolvedValue({ data: { user } });
    mocks.mockSingle.mockResolvedValue({ data: { plant_id: plantId }, error: null });
    mocks.mockInsert.mockResolvedValue({ error: { message: errorMsg } });

    const result = await createWO(formData as any);

    expect(result).toEqual({ error: errorMsg });
  });
});
