import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { adminRoutes } from '@/routes/adminRoutes';

// Central mockable auth state
const mockAuth: any = {
  user: { id: 'u1' },
  role: 'user',
  isAuthenticated: true,
};

vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockAuth,
}));

// Mock all admin pages to lightweight sentinels so we only test access, not UI
vi.mock('@/modules/admin/pages/CompaniesManagementPage', () => ({
  CompaniesManagementPage: () => <div>Companies Page</div>,
}));
vi.mock('@/modules/admin/pages/MembersManagementPage', () => ({
  MembersManagementPage: () => <div>Members Page</div>,
}));
vi.mock('@/modules/admin/pages/InternalAccessPage', () => ({
  InternalAccessPage: () => <div>Internal Access Page</div>,
}));
vi.mock('@/modules/admin/pages/RoleManagementPage', () => ({
  RoleManagementPage: () => <div>Role Management Page</div>,
}));
vi.mock('@/modules/system/pages/SystemModulesPage', () => ({
  SystemModulesPage: () => <div>System Modules Page</div>,
}));
vi.mock('@/modules/leads/pages/AdminLeadsPage', () => ({
  AdminLeadsPage: () => <div>Admin Leads Page</div>,
}));

type AdminRole = 'admin' | 'master_admin';
const routesMatrix: { path: string; label: string; allowed: AdminRole[] }[] = [
  { path: '/admin/companies', label: 'Companies Page', allowed: ['admin', 'master_admin'] },
  { path: '/admin/members', label: 'Members Page', allowed: ['admin', 'master_admin'] },
  { path: '/admin/roles', label: 'Role Management Page', allowed: ['master_admin'] },
  { path: '/admin/system-modules', label: 'System Modules Page', allowed: ['admin', 'master_admin'] },
  { path: '/admin/internal-access', label: 'Internal Access Page', allowed: ['master_admin'] },
  { path: '/admin/leads', label: 'Admin Leads Page', allowed: ['admin', 'master_admin'] },
];

describe('Security Regression - Admin route access by role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.user = { id: 'u1' };
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'user';
  });

  it('denies all admin routes for guest users (redirect to login handled elsewhere)', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    mockAuth.role = 'guest';

    for (const r of routesMatrix) {
      render(
        <MemoryRouter initialEntries={[r.path]}>
          <Routes>{adminRoutes}</Routes>
        </MemoryRouter>
      );
      expect(screen.queryByText(r.label)).not.toBeInTheDocument();
    }
  });

  it('enforces role-based access across all admin routes', () => {
    const rolesToTest = ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'];

    for (const role of rolesToTest) {
      mockAuth.isAuthenticated = role !== 'guest';
      mockAuth.user = role === 'guest' ? null : { id: 'u1' };
      mockAuth.role = role;

      for (const r of routesMatrix) {
        render(
          <MemoryRouter initialEntries={[r.path]}>
            <Routes>{adminRoutes}</Routes>
          </MemoryRouter>
        );

        const shouldSee = r.allowed.includes(role as any);
        if (shouldSee) {
          expect(screen.getByText(r.label)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(r.label)).not.toBeInTheDocument();
        }
      }
    }
  });

  it('regular admin cannot access master_admin-only routes', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'admin';

    const masterOnly = routesMatrix.filter(r => !r.allowed.includes('admin'));
    for (const r of masterOnly) {
      render(
        <MemoryRouter initialEntries={[r.path]}>
          <Routes>{adminRoutes}</Routes>
        </MemoryRouter>
      );
      expect(screen.queryByText(r.label)).not.toBeInTheDocument();
    }
  });

  it('master_admin can access all admin routes', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'master_admin';

    for (const r of routesMatrix) {
      render(
        <MemoryRouter initialEntries={[r.path]}>
          <Routes>{adminRoutes}</Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(r.label)).toBeInTheDocument();
    }
  });
});
