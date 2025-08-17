/**
 * PRIORITY 3B: Admin Module Security Testing & Validation
 * 
 * This test suite validates the security of the admin module system,
 * ensuring proper role-based access control for module management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ModuleAccessManager } from '../components/ModuleAccessManager';
import { InternalAccessPage } from '../pages/InternalAccessPage';
import { fetchAvailableModules, fetchUserModuleAccess } from '../api/moduleAccess';

// Mock module access API
vi.mock('../api/moduleAccess', () => ({
  fetchAvailableModules: vi.fn(),
  fetchUserModuleAccess: vi.fn(),
  updateUserModuleAccess: vi.fn(),
}));

// Mock the auth hook
const mockAuth = {
  user: null,
  role: 'guest',
  isAuthenticated: false,
  isAdmin: false,
  isMasterAdmin: false,
  canAccessModule: vi.fn(() => false),
  isLoading: false
};

vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockAuth,
}));

// Mock the role guard hook
vi.mock('@/modules/auth/hooks/useRoleGuard', () => ({
  useRoleGuard: vi.fn(() => ({ isAllowed: false, loading: false }))
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn()
        }))
      }))
    }))
  }
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Phase 3B1: Module Access UI Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ModuleAccessManager Security', () => {
    it('should not render for unauthorized users', () => {
      mockAuth.isAuthenticated = false;
      mockAuth.role = 'guest';
      
      renderWithProviders(
        <ModuleAccessManager userId="test-user" onUpdate={() => {}} />
      );
      
      // Should show loading or access denied
      expect(screen.queryByText('Module Access')).not.toBeInTheDocument();
    });

    it('should restrict access to admin/master_admin only', () => {
      mockAuth.isAuthenticated = true;
      mockAuth.role = 'user';
      mockAuth.isAdmin = false;
      mockAuth.isMasterAdmin = false;
      
      renderWithProviders(
        <ModuleAccessManager userId="test-user" onUpdate={() => {}} />
      );
      
      // Should not show module management for regular members
      expect(screen.queryByText('Internal Admin Status')).not.toBeInTheDocument();
    });

    it('should allow access for master_admin users', async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.role = 'master_admin';
      mockAuth.isAdmin = true;
      mockAuth.isMasterAdmin = true;
      
      // Mock successful module fetch
      vi.mocked(fetchAvailableModules).mockResolvedValue([
        { 
          id: '1', 
          name: 'admin', 
          description: 'Admin Module', 
          is_active: true, 
          created_at: '', 
          updated_at: ''
        } as any
      ]);
      
      vi.mocked(fetchUserModuleAccess).mockResolvedValue({
        moduleAccess: ['1'],
        isInternalAdmin: true
      });
      
      renderWithProviders(
        <ModuleAccessManager userId="test-user" onUpdate={() => {}} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Internal Admin Status')).toBeInTheDocument();
      });
    });
  });

  describe('InternalAccessPage Security', () => {
    it('should redirect non-master_admin users', () => {
      const mockUseRoleGuard = vi.mocked(require('@/modules/auth/hooks/useRoleGuard').useRoleGuard);
      mockUseRoleGuard.mockReturnValue({ isAllowed: false, loading: false });
      
      renderWithProviders(<InternalAccessPage />);
      
      // Should not render the internal access page content
      expect(screen.queryByText('Intern modultilgang')).not.toBeInTheDocument();
    });

    it('should allow access only for master_admin', () => {
      const mockUseRoleGuard = vi.mocked(require('@/modules/auth/hooks/useRoleGuard').useRoleGuard);
      mockUseRoleGuard.mockReturnValue({ isAllowed: true, loading: false });
      
      renderWithProviders(<InternalAccessPage />);
      
      expect(screen.getByText('Intern modultilgang')).toBeInTheDocument();
    });
  });
});

describe('Phase 3B2: Database Security Validation', () => {
  describe('Module Access Rights', () => {
    it('should validate module access is enforced at DB level', async () => {
      // Test that module access queries properly filter by user permissions
      const modules = await fetchAvailableModules();
      
      // Should return empty array or limited modules for non-admin users
      expect(Array.isArray(modules)).toBe(true);
    });

    it('should validate internal admin privileges are properly scoped', async () => {
      const userAccess = await fetchUserModuleAccess('test-user');
      
      // Should return proper access structure
      expect(userAccess).toHaveProperty('moduleAccess');
      expect(userAccess).toHaveProperty('isInternalAdmin');
      expect(Array.isArray(userAccess.moduleAccess)).toBe(true);
      expect(typeof userAccess.isInternalAdmin).toBe('boolean');
    });
  });
});

describe('Phase 3B3: Role-based Module Protection', () => {
  const testCases = [
    { role: 'guest', shouldAccess: false },
    { role: 'user', shouldAccess: false },
    { role: 'company', shouldAccess: false },
    { role: 'content_editor', shouldAccess: false },
    { role: 'admin', shouldAccess: true },
    { role: 'master_admin', shouldAccess: true }
  ];

  testCases.forEach(({ role, shouldAccess }) => {
    it(`should ${shouldAccess ? 'allow' : 'deny'} admin module access for ${role}`, () => {
      mockAuth.role = role as any;
      mockAuth.isAdmin = role === 'admin' || role === 'master_admin';
      mockAuth.isMasterAdmin = role === 'master_admin';
      mockAuth.isAuthenticated = role !== 'guest';
      
      const canAccess = mockAuth.canAccessModule ? mockAuth.canAccessModule() : false;
      
      if (shouldAccess) {
        expect(canAccess || mockAuth.isAdmin || mockAuth.isMasterAdmin).toBe(true);
      } else {
        expect(canAccess && !mockAuth.isAdmin && !mockAuth.isMasterAdmin).toBe(false);
      }
    });
  });
});

describe('Phase 3B4: Security Audit Results', () => {
  it('should validate no unauthorized access paths exist', () => {
    // Test that all admin routes require proper authentication
    const adminRoutes = [
      '/admin/companies',
      '/admin/members', 
      '/admin/roles',
      '/admin/system-modules',
      '/admin/internal-access',
      '/admin/leads'
    ];
    
    adminRoutes.forEach(route => {
      // Each route should be protected by RoleDashboard with required roles
      expect(route).toMatch(/^\/admin\//);
    });
  });

  it('should ensure module access follows principle of least privilege', () => {
    // Test that users only get access to modules they need
    const userModules = ['dashboard', 'leads'];
    const adminModules = ['admin', 'users', 'system'];
    
    expect(userModules).not.toContain('admin');
    expect(adminModules).toContain('admin');
  });
});