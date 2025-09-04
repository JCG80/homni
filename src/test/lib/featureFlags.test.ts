import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeatureFlag, useFeatureFlags, HOMNI_FEATURES } from '@/lib/featureFlags';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return Wrapper;
};

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useFeatureFlags', () => {
    it('fetches feature flags from database', async () => {
      const mockFlags = [
        {
          id: '1',
          name: 'leads-module',
          description: 'Enable leads module',
          is_enabled: true,
          rollout_percentage: 100,
          target_roles: ['user', 'company'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'propr-module',
          description: 'Enable Propr module',
          is_enabled: false,
          rollout_percentage: 0,
          target_roles: ['user'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockFlags,
            error: null
          })
        })
      });

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockFlags);
    });

    it('handles database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      });

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useFeatureFlag', () => {
    beforeEach(() => {
      // Mock feature flags query
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: '1',
                name: 'leads-module',
                is_enabled: true,
                rollout_percentage: 100,
                target_roles: ['user', 'company']
              },
              {
                id: '2',
                name: 'propr-module',
                is_enabled: false,
                rollout_percentage: 0,
                target_roles: ['user']
              }
            ],
            error: null
          })
        })
      });

      // Mock RPC call for feature flag check
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });
    });

    it('returns false for disabled feature', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: false,
        error: null
      });

      const { result } = renderHook(() => useFeatureFlag('propr-module'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('returns true for enabled feature', async () => {
      const { result } = renderHook(() => useFeatureFlag('leads-module'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('returns false for non-existent feature', async () => {
      const { result } = renderHook(() => useFeatureFlag('non-existent-feature'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('handles RPC errors gracefully', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: new Error('RPC failed')
      });

      const { result } = renderHook(() => useFeatureFlag('leads-module'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('HOMNI_FEATURES constants', () => {
    it('exports all required feature flags', () => {
      expect(HOMNI_FEATURES).toEqual({
        LEADS_MODULE: 'leads-module',
        BOLIGMAPPA_MODULE: 'boligmappa-module', 
        PROPR_MODULE: 'propr-module',
        AI_INTEGRATION: 'ai-integration',
        ADVANCED_ANALYTICS: 'advanced-analytics',
        MARKETPLACE: 'lead-marketplace',
      });
    });

    it('feature flag names are consistent with Master Prompt requirements', () => {
      // Validate that feature flags align with the three core modules
      expect(HOMNI_FEATURES.LEADS_MODULE).toBe('leads-module'); // Bytt.no-style
      expect(HOMNI_FEATURES.BOLIGMAPPA_MODULE).toBe('boligmappa-module'); // Boligmappa.no-style  
      expect(HOMNI_FEATURES.PROPR_MODULE).toBe('propr-module'); // Propr.no-style
      expect(HOMNI_FEATURES.MARKETPLACE).toBe('lead-marketplace'); // Lead marketplace
    });
  });
});