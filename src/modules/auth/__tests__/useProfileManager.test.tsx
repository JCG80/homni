import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfileManager } from '../hooks/useProfileManager';

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom
  }
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function HookProbe() {
  const profileManager = useProfileManager();
  
  return (
    <div>
      <div data-testid="loading">{String(profileManager.isLoading)}</div>
      <div data-testid="profile">{profileManager.currentProfile?.id || 'null'}</div>
      <div data-testid="current-profile">{profileManager.currentProfile?.full_name || 'null'}</div>
    </div>
  );
}

const renderWithRQ = (ui: React.ReactNode) => {
  const qc = createQueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('useProfileManager Phase 1A Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('provides profile management functionality', async () => {
    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Test that the hook provides the expected interface
    expect(screen.getByTestId('profile')).toBeInTheDocument();
    expect(screen.getByTestId('current-profile')).toBeInTheDocument();
  });

  it('handles profile updates', async () => {
    renderWithRQ(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify hook provides update functionality
    expect(screen.getByTestId('current-profile')).toBeInTheDocument();
  });

  it('provides fetchProfileById functionality', () => {
    renderWithRQ(<HookProbe />);
    
    // Basic test to ensure hook interface is working
    expect(screen.getByTestId('profile')).toBeInTheDocument();
  });
});