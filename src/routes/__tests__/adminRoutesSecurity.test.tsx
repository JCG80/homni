import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

// Mock useAuth for RoleDashboard
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockAuth,
}));

const mockAuth = {
  isAuthenticated: false,
  isLoading: false,
  role: 'guest',
};

const renderWithRouter = (ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>{ui}</Routes>
    </MemoryRouter>
  );

describe('Admin route security via RoleDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies access to non-authenticated users', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.role = 'guest';

    renderWithRouter(
      <Route path="/" element={
        <RoleDashboard title="Admin" requiredRole={["admin", "master_admin"]}>
          <div>Protected Admin</div>
        </RoleDashboard>
      } />
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Admin')).not.toBeInTheDocument();
  });

  it('denies access to user role for admin-only content', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'user';

    renderWithRouter(
      <Route path="/" element={
        <RoleDashboard title="Admin" requiredRole={["admin", "master_admin"]}>
          <div>Protected Admin</div>
        </RoleDashboard>
      } />
    );

    expect(screen.queryByText('Protected Admin')).not.toBeInTheDocument();
  });

  it('allows access to admin role', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'admin';

    renderWithRouter(
      <Route path="/" element={
        <RoleDashboard title="Admin" requiredRole={["admin", "master_admin"]}>
          <div>Protected Admin</div>
        </RoleDashboard>
      } />
    );

    // When allowed, content should be present
    expect(screen.getByText('Protected Admin')).toBeInTheDocument();
  });

  it('allows access to master_admin role', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'master_admin';

    renderWithRouter(
      <Route path="/" element={
        <RoleDashboard title="Admin" requiredRole={["admin", "master_admin"]}>
          <div>Protected Admin</div>
        </RoleDashboard>
      } />
    );

    expect(screen.getByText('Protected Admin')).toBeInTheDocument();
  });
});
