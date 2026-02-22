import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { WOList } from '@/components/WOList';
import { MantineProvider } from '@mantine/core';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock the actions
const { mockGetPOs, mockGetItems, mockCreateWO } = vi.hoisted(() => {
  return {
    mockGetPOs: vi.fn().mockResolvedValue([]),
    mockGetItems: vi.fn().mockResolvedValue([]),
    mockCreateWO: vi.fn().mockResolvedValue({ success: true }),
  };
});

vi.mock('@/app/actions/po', () => ({
  getPOs: mockGetPOs,
}));

vi.mock('@/app/actions/items', () => ({
  getItems: mockGetItems,
}));

vi.mock('@/app/actions/wo', () => ({
  createWO: mockCreateWO,
}));

// Setup matchMedia and ResizeObserver
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('WOList Component', () => {
  it('does NOT fetch POs and Items on mount (optimized behavior)', async () => {
    const mockPOs = [{ id: 'po1', po_number: 'PO-123' }];
    const mockItems = [{ id: 'item1', item_code: 'ITEM-ABC' }];

    render(
      <MantineProvider>
        <WOList
            initialWOs={[]}
            pos={mockPOs as any}
            items={mockItems as any}
        />
      </MantineProvider>
    );

    // Wait a bit to ensure useEffect would have run if it existed
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockGetPOs).not.toHaveBeenCalled();
    expect(mockGetItems).not.toHaveBeenCalled();
  });
});
