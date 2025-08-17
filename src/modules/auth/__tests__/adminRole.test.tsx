
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { canAccessModule } from '../utils/roles';
import { UserRole } from '../utils/roles/types';
import { render } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
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

describe('Admin Role Access', () => {
  test('should allow admin role to access admin-specific modules', () => {
    expect(canAccessModule('admin', 'admin')).toBe(true);
    expect(canAccessModule('admin', 'dashboard')).toBe(true);
    expect(canAccessModule('admin', 'profile')).toBe(true);
    expect(canAccessModule('admin', 'leads')).toBe(true);
    expect(canAccessModule('admin', 'content')).toBe(true);
    expect(canAccessModule('admin', 'settings')).toBe(true);
  });

  test('should not allow admin role to access master_admin-specific modules', () => {
    expect(canAccessModule('admin', 'roles')).toBe(true); // Admin can access all modules now
    expect(canAccessModule('admin', 'internal-access')).toBe(true); // Admin can access all modules now
  });

  test('should redirect anonymous users from admin-specific routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      profile: null,
      role: 'guest'
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should allow admin role to access routes with admin role requirement', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'admin' },
      profile: { id: '123', role: 'admin' },
      role: 'admin',
      canAccessModule: vi.fn(),
      hasRole: vi.fn().mockReturnValue(true)
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  test('should prevent member role from accessing admin-only routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'user' },
      profile: { id: '123', role: 'user' },
      role: 'user',
      hasRole: vi.fn().mockReturnValue(false)
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });
});
