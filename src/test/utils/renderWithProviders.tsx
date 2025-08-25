/**
 * Testing utilities for rendering components with providers
 */

import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { AuthProvider } from '@/modules/auth/hooks/useAuth';
import { createMockAuthContext } from '@/test/factories/userFactory';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: any;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    authContext = createMockAuthContext(),
    initialEntries = ['/'],
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    // Mock the auth context
    return (
      <div data-testid="mock-auth-provider">
        {children}
      </div>
    );
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MockAuthProvider>
            {children}
          </MockAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Utility for testing hooks
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

// Mock router utilities
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});