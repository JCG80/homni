
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { canAccessModule } from '../utils/roles';
import { UserRole } from '../utils/roles/types';
import { render } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock the react-router-dom's useLocation and Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/test' }),
    Navigate: ({ to }) => `<div data-testid="navigate" data-to="${to}">Navigate to ${to}</div>`
  };
});

describe('Master Admin Role Access', () => {
  test('should allow master_admin role to access all modules', () => {
    // Master admin should have access to everything
    expect(canAccessModule('master_admin', 'admin')).toBe(true);
    expect(canAccessModule('master_admin', 'dashboard')).toBe(true);
    expect(canAccessModule('master_admin', 'profile')).toBe(true);
    expect(canAccessModule('master_admin', 'leads')).toBe(true);
    expect(canAccessModule('master_admin', 'content')).toBe(true);
    expect(canAccessModule('master_admin', 'settings')).toBe(true);
    expect(canAccessModule('master_admin', 'roles')).toBe(true);
    expect(canAccessModule('master_admin', 'members')).toBe(true);
    expect(canAccessModule('master_admin', 'companies')).toBe(true);
    expect(canAccessModule('master_admin', 'internal-access')).toBe(true);
  });

  test('should allow master_admin role to access routes with master_admin role requirement', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'master_admin' },
      profile: { id: '123', role: 'master_admin' },
      role: 'master_admin'
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['master_admin']}>
          <div>Master Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Master Admin Content')).toBeInTheDocument();
  });

  test('should prevent regular admin from accessing master_admin-only routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'admin' },
      profile: { id: '123', role: 'admin' },
      role: 'admin'
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['master_admin']}>
          <div>Master Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });
});
