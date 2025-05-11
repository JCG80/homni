
import { describe, test, expect, vi } from 'vitest';
import { canAccessModule } from '../utils/roles';
import { UserRole } from '../types/types';
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
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
  };
});

describe('User Role Access', () => {
  test('should allow user role to access user-specific modules', () => {
    expect(canAccessModule('user', 'dashboard')).toBe(true);
    expect(canAccessModule('user', 'leads')).toBe(true);
    expect(canAccessModule('user', 'leads/my')).toBe(true);
    expect(canAccessModule('user', 'properties')).toBe(true);
    expect(canAccessModule('user', 'maintenance')).toBe(true);
    expect(canAccessModule('user', 'profile')).toBe(true);
    expect(canAccessModule('user', 'my-account')).toBe(true);
  });

  test('should not allow user role to access admin or company modules', () => {
    expect(canAccessModule('user', 'admin')).toBe(false);
    expect(canAccessModule('user', 'company/profile')).toBe(false);
    expect(canAccessModule('user', 'content')).toBe(false);
    expect(canAccessModule('user', 'settings')).toBe(false);
  });

  test('should redirect anonymous users from user-specific routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      profile: null,
      role: 'anonymous'
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['user']}>
          <div>User Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should allow user role to access routes with user role requirement', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'user' },
      profile: { id: '123', role: 'user' },
      role: 'user'
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['user']}>
          <div>User Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('User Content')).toBeInTheDocument();
  });
});
