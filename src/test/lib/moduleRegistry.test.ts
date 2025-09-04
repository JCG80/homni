import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useActiveModules, 
  useModuleRoutes, 
  useModuleActive,
  CORE_MODULES 
} from '@/lib/moduleRegistry';
import { supabase } from '@/integrations/supabase/client';

// Mock feature flags
vi.mock('@/lib/featureFlags', () => ({
  useFeatureFlag: vi.fn((flagName: string) => {
    const enabledFlags = ['leads-module', 'boligmappa-module'];
    return enabledFlags.includes(flagName);
  })
}));

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

describe('Module Registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useActiveModules', () => {
    it('returns active modules based on feature flags and database', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'leads',
          description: 'Lead generation system',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'boligmappa',
          description: 'Property documentation',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'propr',
          description: 'DIY selling module',
          version: '0.1.0',
          dependencies: ['leads'],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useActiveModules(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.length).toBeGreaterThan(0);
      });

      // Should include leads and boligmappa (enabled via feature flags)
      // Should exclude propr (disabled via feature flag)
      const moduleNames = result.current.map(m => m.name);
      expect(moduleNames).toContain('leads');
      expect(moduleNames).toContain('boligmappa');
      expect(moduleNames).not.toContain('propr');
    });

    it('filters out inactive modules', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'leads',
          description: 'Lead generation system',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: false, // Inactive
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useActiveModules(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toEqual([]);
      });
    });
  });

  describe('useModuleRoutes', () => {
    it('returns flattened routes from all active modules', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'leads',
          description: 'Lead generation system',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useModuleRoutes(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.length).toBeGreaterThan(0);
      });

      // Should include leads routes
      const routes = result.current;
      expect(routes.some(route => route.path === '/leads')).toBe(true);
      expect(routes.some(route => route.path === '/leads/my')).toBe(true);
      expect(routes.some(route => route.path === '/leads/create')).toBe(true);
      expect(routes.some(route => route.path === '/leads/manage')).toBe(true);
    });
  });

  describe('useModuleActive', () => {
    it('returns true for active modules', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'leads',
          description: 'Lead generation system',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useModuleActive('leads'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('returns false for inactive or non-existent modules', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useModuleActive('non-existent'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('CORE_MODULES', () => {
    it('defines essential modules that are always available', () => {
      expect(CORE_MODULES).toHaveLength(2);
      
      const authModule = CORE_MODULES.find(m => m.name === 'auth');
      const dashboardModule = CORE_MODULES.find(m => m.name === 'dashboard');
      
      expect(authModule).toBeDefined();
      expect(dashboardModule).toBeDefined();
      
      expect(authModule?.isActive).toBe(true);
      expect(dashboardModule?.isActive).toBe(true);
    });

    it('auth module has correct routes', () => {
      const authModule = CORE_MODULES.find(m => m.name === 'auth');
      
      expect(authModule?.routes).toEqual([
        { path: '/login', component: 'Login', roles: ['guest'], title: 'Login' },
        { path: '/register', component: 'Register', roles: ['guest'], title: 'Register' },
        { path: '/profile', component: 'Profile', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Profile' },
      ]);
    });

    it('dashboard module has correct routes', () => {
      const dashboardModule = CORE_MODULES.find(m => m.name === 'dashboard');
      
      expect(dashboardModule?.routes).toEqual([
        { path: '/', component: 'Dashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Dashboard' },
        { path: '/dashboard', component: 'Dashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Dashboard' },
      ]);
    });
  });

  describe('module route definitions', () => {
    it('leads module has correct Master Prompt compliant routes', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'leads',
          description: 'Lead generation system',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useActiveModules(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.length).toBeGreaterThan(0);
      });

      const leadsModule = result.current.find(m => m.name === 'leads');
      expect(leadsModule?.routes).toEqual([
        { path: '/leads', component: 'LeadsDashboard', roles: ['user', 'company', 'admin', 'master_admin'], title: 'Leads' },
        { path: '/leads/my', component: 'MyLeads', roles: ['user', 'company'], title: 'My Leads' },
        { path: '/leads/create', component: 'CreateLead', roles: ['user'], title: 'Create Lead' },
        { path: '/leads/manage', component: 'ManageLeads', roles: ['admin', 'master_admin'], title: 'Manage Leads' },
      ]);
    });

    it('boligmappa module has correct Master Prompt compliant routes', async () => {
      const mockModuleMetadata = [
        {
          id: '1',
          name: 'boligmappa',
          description: 'Property documentation',
          version: '1.0.0',
          dependencies: [],
          feature_flags: {},
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockModuleMetadata,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useActiveModules(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.length).toBeGreaterThan(0);
      });

      const boligmappaModule = result.current.find(m => m.name === 'boligmappa');
      expect(boligmappaModule?.routes).toEqual([
        { path: '/properties', component: 'PropertiesDashboard', roles: ['user'], title: 'Properties' },
        { path: '/properties/create', component: 'CreateProperty', roles: ['user'], title: 'Add Property' },
        { path: '/properties/:id', component: 'PropertyDetails', roles: ['user'], title: 'Property Details' },
        { path: '/properties/:id/documents', component: 'PropertyDocuments', roles: ['user'], title: 'Documents' },
      ]);
    });
  });
});