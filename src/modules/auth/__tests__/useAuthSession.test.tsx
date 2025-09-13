import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthSession } from '../hooks/useAuthSession';

// Mock Supabase client
const mockOnAuthStateChange = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: mockOnAuthStateChange,
      getSession: mockGetSession,
      getUser: mockGetUser,
    }
  }
}));

// Mock user profile queries
vi.mock('@/modules/auth/hooks/useUserProfileQuery', () => ({
  useUserProfileQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  }))
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function HookProbe() {
  const authSession = useAuthSession();
  
  return (
    <div>
      <div data-testid="loading">{String(authSession.isLoading)}</div>
      <div data-testid="user">{authSession.user?.id || 'null'}</div>
      <div data-testid="profile">{authSession.profile?.id || 'null'}</div>
    </div>
  );
}

const renderWithRQ = (ui: React.ReactNode) => {
  const qc = createQueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('useAuthSession Phase 1A Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles initial loading state correctly', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: {} } });

    renderWithRQ(<HookProbe />);

    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('manages authenticated user session', async () => {
    const mockUser = { id: 'test-user-123', email: 'user@test.com' };
    const mockSession = { user: mockUser, access_token: 'token123' };
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: {} } });

    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test-user-123');
    });
  });

  it('handles session errors gracefully', async () => {
    mockGetSession.mockResolvedValue({ 
      data: { session: null }, 
      error: { message: 'Network error' } 
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: {} } });

    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('subscribes to auth state changes on mount', () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: {} } });

    renderWithRQ(<HookProbe />);

    expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('cleans up subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ 
      data: { subscription: { unsubscribe: mockUnsubscribe } } 
    });

    const { unmount } = renderWithRQ(<HookProbe />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});