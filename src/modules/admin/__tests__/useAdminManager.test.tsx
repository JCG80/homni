/**
 * Tests for useAdminManager hook
 * Covers admin operations and system management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminManager } from '../hooks/useAdminManager';
import { mockUserProfiles, createTestQueryClient, renderWithQueryClient } from '@/test/utils/testHelpers';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock auth hook with admin user
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1' },
    profile: mockUserProfiles.admin,
    isLoading: false,
  }),
}));

describe('useAdminManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide admin management interface', () => {
    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    expect(result.current).toHaveProperty('users');
    expect(result.current).toHaveProperty('companies');
    expect(result.current).toHaveProperty('leads');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('updateUserRole');
    expect(result.current).toHaveProperty('deleteUser');
    expect(result.current).toHaveProperty('systemHealth');
  });

  it('should handle user role updates', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock RPC call for role update
    (supabase.rpc as any).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.updateUserRole).toBeDefined();
    });

    expect(typeof result.current.updateUserRole).toBe('function');
  });

  it('should handle user deletion', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful deletion
    (supabase.delete as any).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.deleteUser).toBeDefined();
    });

    expect(typeof result.current.deleteUser).toBe('function');
  });

  it('should handle system health checks', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock system health data
    (supabase.rpc as any).mockResolvedValue({
      data: {
        status: 'healthy',
        checks: {
          database: { status: 'healthy', connections: 5 },
          errors: { recent_count: 0, status: 'ok' },
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.getSystemHealth).toBeDefined();
    });

    expect(typeof result.current.getSystemHealth).toBe('function');
  });

  it('should handle company management', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock company data
    (supabase.select as any).mockResolvedValue({
      data: [
        {
          id: 'company-1',
          name: 'Test Company',
          status: 'active',
          current_budget: 5000,
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.updateCompanyBudget).toBeDefined();
    });

    expect(typeof result.current.updateCompanyBudget).toBe('function');
  });

  it('should handle lead management', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock lead assignment
    (supabase.rpc as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.assignLeadToCompany).toBeDefined();
    });

    expect(typeof result.current.assignLeadToCompany).toBe('function');
  });

  it('should handle audit log viewing', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock audit logs
    (supabase.select as any).mockResolvedValue({
      data: [
        {
          id: 'log-1',
          action: 'user_role_updated',
          admin_user_id: 'admin-1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.getAuditLogs).toBeDefined();
    });

    expect(typeof result.current.getAuditLogs).toBe('function');
  });

  it('should handle errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock error response
    (supabase.select as any).mockResolvedValue({
      data: null,
      error: { message: 'Permission denied' },
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeDefined();
    });

    expect(result.current).toHaveProperty('users');
    expect(result.current).toHaveProperty('companies');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('should handle module access management', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock module access update
    (supabase.rpc as any).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.updateUserModules).toBeDefined();
    });

    expect(typeof result.current.updateUserModules).toBe('function');
  });

  it('should handle analytics and reporting', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock analytics data
    (supabase.select as any).mockResolvedValue({
      data: [
        {
          metric_name: 'active_users',
          metric_value: 100,
          date_recorded: '2024-01-01',
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useAdminManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.getAnalytics).toBeDefined();
    });

    expect(typeof result.current.getAnalytics).toBe('function');
  });
});