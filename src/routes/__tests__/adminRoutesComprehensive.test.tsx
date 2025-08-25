import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { adminRoutes } from '@/routes/adminRoutes';

// Mock useAuth to control role
const mockAuth: any = {
  user: { id: 'u1' },
  role: 'user',
  isAuthenticated: true,
  isAdmin: false,
  isMasterAdmin: false,
};

vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockAuth,
}));

// Mock role protection used by InternalAccessPage
const mockUseRoleProtection = vi.fn(() => ({ isAllowed: false, loading: false }));
vi.mock('@/modules/auth/hooks/useRoleProtection', () => ({
  useRoleProtection: () => mockUseRoleProtection(),
}));

describe('Admin routes comprehensive security - internal access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.role = 'user';
    mockAuth.isAdmin = false;
    mockAuth.isMasterAdmin = false;
  });

  it('denies /admin/internal-access for non-master_admin', () => {
    mockUseRoleProtection.mockReturnValue({ isAllowed: false, loading: false });

    render(
      <MemoryRouter initialEntries={["/admin/internal-access"]}>
        <Routes>{adminRoutes}</Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Intern modultilgang')).not.toBeInTheDocument();
  });

  it('allows /admin/internal-access for master_admin', () => {
    mockAuth.role = 'master_admin';
    mockAuth.isAdmin = true;
    mockAuth.isMasterAdmin = true;
    mockUseRoleProtection.mockReturnValue({ isAllowed: true, loading: false });

    render(
      <MemoryRouter initialEntries={["/admin/internal-access"]}>
        <Routes>{adminRoutes}</Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Intern modultilgang')).toBeInTheDocument();
  });
});
