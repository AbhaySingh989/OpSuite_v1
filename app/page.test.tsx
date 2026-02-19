import { render, screen } from '@testing-library/react';
import Home from './page';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Home Page', () => {
  it('renders login button', () => {
    render(
        <MantineProvider>
            <Home />
        </MantineProvider>
    );
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });
});
