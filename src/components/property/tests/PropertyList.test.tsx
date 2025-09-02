import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PropertyList } from '../PropertyList';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
  
  return Wrapper;
};

describe('PropertyList', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { id: 'test-user-id' } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no properties', async () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <PropertyList />
      </Wrapper>
    );

    expect(await screen.findByText('Ingen eiendommer registrert')).toBeInTheDocument();
    expect(screen.getByText('Legg til din første eiendom for å begynne å administrere dokumentasjon og vedlikehold.')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const Wrapper = createTestWrapper();
    
    render(
      <Wrapper>
        <PropertyList />
      </Wrapper>
    );

    // Check for loading skeleton
    expect(screen.getAllByRole('generic')).toHaveLength(6); // 3 cards with 2 skeleton elements each
  });
});