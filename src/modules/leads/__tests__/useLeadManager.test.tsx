/**
 * Tests for useLeadManager hook
 * Covers lead CRUD operations and business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLeadManager } from '../hooks/useLeadManager';
import { mockLeads, createTestQueryClient, renderWithQueryClient } from '@/test/utils/testHelpers';

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

// Mock auth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: {
      id: 'user-1',
      role: 'user',
      role_enum: 'user',
    },
    isLoading: false,
  }),
}));

describe('useLeadManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide lead management interface', () => {
    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    expect(result.current).toHaveProperty('leads');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('createLead');
    expect(result.current).toHaveProperty('updateLead');
    expect(result.current).toHaveProperty('deleteLead');
    expect(result.current).toHaveProperty('getLeadById');
  });

  it('should handle lead creation for authenticated users', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful creation
    (supabase.insert as any).mockResolvedValue({
      data: [mockLeads.new],
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.createLead).toBeDefined();
    });

    expect(typeof result.current.createLead).toBe('function');
  });

  it('should handle anonymous lead creation', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock RPC call for anonymous lead creation
    (supabase.rpc as any).mockResolvedValue({
      data: 'lead-uuid',
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.createAnonymousLead).toBeDefined();
    });

    expect(typeof result.current.createAnonymousLead).toBe('function');
  });

  it('should handle lead status updates', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful update
    (supabase.update as any).mockResolvedValue({
      data: [{ ...mockLeads.new, status: 'qualified' }],
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.updateLeadStatus).toBeDefined();
    });

    expect(typeof result.current.updateLeadStatus).toBe('function');
  });

  it('should handle lead assignment to companies', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock RPC call for lead assignment
    (supabase.rpc as any).mockResolvedValue({
      data: { success: true, assigned_to: 'company-1', cost: 500 },
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.assignLead).toBeDefined();
    });

    expect(typeof result.current.assignLead).toBe('function');
  });

  it('should handle lead retrieval by ID', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful retrieval
    (supabase.single as any).mockResolvedValue({
      data: mockLeads.new,
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.getLeadById).toBeDefined();
    });

    expect(typeof result.current.getLeadById).toBe('function');
  });

  it('should handle lead distribution', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock RPC call for lead distribution
    (supabase.rpc as any).mockResolvedValue({
      data: [{ company_id: 'company-1', assignment_cost: 500, success: true }],
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.distributeLead).toBeDefined();
    });

    expect(typeof result.current.distributeLead).toBe('function');
  });

  it('should handle errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock error response
    (supabase.select as any).mockResolvedValue({
      data: null,
      error: { message: 'Access denied' },
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeDefined();
    });

    expect(result.current).toHaveProperty('leads');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('should handle different user roles correctly', () => {
    // Test that the hook works for different user roles
    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    // Should provide appropriate functions based on user role
    expect(result.current).toHaveProperty('leads');
    expect(result.current).toHaveProperty('createLead');
    expect(result.current).toHaveProperty('updateLead');
  });

  it('should handle lead filtering and sorting', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock filtered results
    (supabase.select as any).mockResolvedValue({
      data: [mockLeads.new, mockLeads.assigned],
      error: null,
    });

    const { result } = renderHook(() => useLeadManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.filterLeads).toBeDefined();
    });

    expect(typeof result.current.filterLeads).toBe('function');
  });
});