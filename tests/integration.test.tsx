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
        <POList initialPOs={[]} initialCustomers={[]} />
      </MantineProvider>
    );

    // 1. Open Modal
    // Use getAllByText because there might be multiple "Create PO" (button and maybe title?)
    // Actually the button text is "Create PO".
    // We can use getAllByRole('button', { name: 'Create PO' })[0]
    const openBtns = screen.getAllByRole('button', { name: /Create PO/i });
    fireEvent.click(openBtns[0]);

    // Check if title is visible (Modal content)
    await waitFor(() => expect(screen.getByText('Create Purchase Order')).toBeInTheDocument());

    // 2. Fill Form
    const poInput = screen.getByPlaceholderText('e.g. PO-2024-001');
    fireEvent.change(poInput, { target: { value: 'PO-TEST-001' } });

    // 3. Submit
    // Now we want the submit button. It should be the second one or we can look for it specifically.
    // Or we can query inside the modal if we had a test-id.
    // But simply, since the modal is open, the submit button is likely the last one or we can filter by type="submit" if we could.
    // Let's grab all buttons named "Create PO" again.
    const createBtns = screen.getAllByRole('button', { name: /Create PO/i });
    // The submit button is usually the last one rendered or the one in the modal.
    fireEvent.click(createBtns[createBtns.length - 1]);
  });
});
