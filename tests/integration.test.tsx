import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { POList } from '@/components/POList';
import { MantineProvider } from '@mantine/core';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/app/actions/customers', () => ({
  getCustomers: vi.fn().mockResolvedValue([{ id: 'c1', name: 'Test Customer' }]),
}));

vi.mock('@/app/actions/po', () => ({
  createPO: vi.fn().mockResolvedValue({ success: true }),
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

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('PO Creation Flow', () => {
  it('opens modal and submits form', async () => {
    render(
      <MantineProvider>
        <POList initialPOs={[]} />
      </MantineProvider>
    );

    // 1. Open Modal
    fireEvent.click(screen.getByText('Create PO'));

    // Check if title is visible (Modal content)
    await waitFor(() => expect(screen.getByText('Create Purchase Order')).toBeInTheDocument());

    // 2. Fill Form
    const poInput = screen.getByPlaceholderText('PO-1234');
    fireEvent.change(poInput, { target: { value: 'PO-TEST-001' } });

    // 3. Submit
    const createBtn = screen.getByRole('button', { name: /Create$/i });
    fireEvent.click(createBtn);
  });
});
