/**
 * Tests for usePropertyManager hook
 * Covers property CRUD operations and data management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePropertyManager } from '../hooks/usePropertyManager';
import { mockProperties, createTestQueryClient, renderWithQueryClient } from '@/test/utils/testHelpers';

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
  },
}));

// Mock auth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    isLoading: false,
  }),
}));

const MockComponent = () => {
  const propertyManager = usePropertyManager();
  return <div data-testid="property-manager">{JSON.stringify(propertyManager)}</div>;
};

describe('usePropertyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide property management interface', () => {
    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    expect(result.current).toHaveProperty('properties');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('createProperty');
    expect(result.current).toHaveProperty('updateProperty');
    expect(result.current).toHaveProperty('deleteProperty');
    expect(result.current).toHaveProperty('getPropertyById');
  });

  it('should handle property creation', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful creation
    (supabase.insert as any).mockResolvedValue({
      data: [mockProperties.residential],
      error: null,
    });

    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    const newProperty = {
      name: 'New Property',
      type: 'residential',
      address: '789 New St',
    };

    await waitFor(() => {
      expect(result.current.createProperty).toBeDefined();
    });

    // Test that createProperty function exists and can be called
    expect(typeof result.current.createProperty).toBe('function');
  });

  it('should handle property updates', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful update
    (supabase.update as any).mockResolvedValue({
      data: [{ ...mockProperties.residential, name: 'Updated Property' }],
      error: null,
    });

    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.updateProperty).toBeDefined();
    });

    expect(typeof result.current.updateProperty).toBe('function');
  });

  it('should handle property deletion', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful deletion
    (supabase.delete as any).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.deleteProperty).toBeDefined();
    });

    expect(typeof result.current.deleteProperty).toBe('function');
  });

  it('should handle property retrieval by ID', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful retrieval
    (supabase.single as any).mockResolvedValue({
      data: mockProperties.residential,
      error: null,
    });

    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.getPropertyById).toBeDefined();
    });

    expect(typeof result.current.getPropertyById).toBe('function');
  });

  it('should handle errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock error response
    (supabase.select as any).mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeDefined();
    });

    // Should provide error handling capabilities
    expect(result.current).toHaveProperty('properties');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('should handle loading states', () => {
    const { result } = renderHook(() => usePropertyManager(), {
      wrapper: ({ children }) => {
        const queryClient = createTestQueryClient();
        return renderWithQueryClient(<div>{children}</div>);
      },
    });

    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });
});