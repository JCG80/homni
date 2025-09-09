import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useAuth used by the hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

// Supabase client chain mocks
const eqMock = vi.fn();
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));
const rpcMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { 
    from: fromMock,
    rpc: rpcMock
  },
}));

import { useModuleAccessQuery } from '@/modules/auth/hooks/useModuleAccessQuery';

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function HookProbe() {
  const { data } = useModuleAccessQuery();
  return (
    <div>
      <div data-testid="modules">{JSON.stringify(data?.moduleAccess ?? [])}</div>
      <div data-testid="internal-admin">{String(data?.isInternalAdmin ?? false)}</div>
    </div>
  );
}

const renderWithRQ = (ui: React.ReactNode) => {
  const qc = createQueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('useModuleAccessQuery - database validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns defaults when no user', async () => {
    // Override auth mock to simulate no user
    vi.doMock('@/modules/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
    const { useModuleAccessQuery: useHook } = await import('@/modules/auth/hooks/useModuleAccessQuery');

    function NoUserProbe() {
      const { data } = useHook();
      return (
        <>
          <div data-testid="modules">{JSON.stringify(data?.moduleAccess ?? [])}</div>
          <div data-testid="internal-admin">{String(data?.isInternalAdmin ?? false)}</div>
        </>
      );
    }

    renderWithRQ(<NoUserProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('modules').textContent).toBe('[]');
      expect(screen.getByTestId('internal-admin').textContent).toBe('false');
    });

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('fetches module access with correct filter and parses correctly', async () => {
    // Mock user_modules query
    eqMock.mockResolvedValueOnce({
      data: [
        { module_id: '1' },
        { module_id: '2' },
      ],
      error: null,
    });

    // Mock is_internal_admin RPC
    rpcMock.mockResolvedValueOnce({
      data: true,
      error: null,
    });

    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(fromMock).toHaveBeenCalledWith('user_modules');
      expect(selectMock).toHaveBeenCalledWith('module_id');
      expect(eqMock).toHaveBeenCalledWith('user_id', 'test-user');
      expect(eqMock).toHaveBeenCalledWith('is_enabled', true);
      expect(rpcMock).toHaveBeenCalledWith('is_internal_admin', { check_user_id: 'test-user' });
      expect(screen.getByTestId('modules').textContent).toBe('["1","2"]');
      expect(screen.getByTestId('internal-admin').textContent).toBe('true');
    });
  });

  it('handles errors by returning safe defaults', async () => {
    eqMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    rpcMock.mockResolvedValueOnce({ data: false, error: null });

    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('modules').textContent).toBe('[]');
      expect(screen.getByTestId('internal-admin').textContent).toBe('false');
    });
  });
});
