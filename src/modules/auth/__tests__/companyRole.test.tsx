
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

describe('Company Role Access', () => {
  test('should allow company role to access company-specific modules', () => {
    expect(canAccessModule('company', 'dashboard')).toBe(true);
    expect(canAccessModule('company', 'leads')).toBe(true);
    expect(canAccessModule('company', 'profile')).toBe(true);
    expect(canAccessModule('company', 'settings')).toBe(true);
  });

  test('should not allow company role to access admin-specific modules', () => {
    expect(canAccessModule('company', 'admin')).toBe(false);
    expect(canAccessModule('company', 'roles')).toBe(false);
    expect(canAccessModule('company', 'internal-access')).toBe(false);
  });

  test('should redirect anonymous users from company-specific routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      profile: null,
      role: 'anonymous'
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['company']}>
          <div>Company Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should allow company role to access routes with company role requirement', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'company' },
      profile: { id: '123', role: 'company' },
      role: 'company',
      canAccessModule: vi.fn(),
      hasRole: vi.fn().mockReturnValue(true)
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['company']}>
          <div>Company Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Company Content')).toBeInTheDocument();
  });

  test('should prevent member role from accessing company-only routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'member' },
      profile: { id: '123', role: 'member' },
      role: 'member',
      hasRole: vi.fn().mockReturnValue(false)
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['company']}>
          <div>Company Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });
});
