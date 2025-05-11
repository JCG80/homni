
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

describe('Member Role Access', () => {
  test('should allow member role to access member-specific modules', () => {
    expect(canAccessModule('member', 'dashboard')).toBe(true);
    expect(canAccessModule('member', 'leads')).toBe(true);
    expect(canAccessModule('member', 'leads/my')).toBe(true);
    expect(canAccessModule('member', 'properties')).toBe(true);
    expect(canAccessModule('member', 'maintenance')).toBe(true);
    expect(canAccessModule('member', 'profile')).toBe(true);
    expect(canAccessModule('member', 'my-account')).toBe(true);
  });

  test('should not allow member role to access admin or company modules', () => {
    expect(canAccessModule('member', 'admin')).toBe(false);
    expect(canAccessModule('member', 'company/profile')).toBe(false);
    expect(canAccessModule('member', 'content')).toBe(false);
    expect(canAccessModule('member', 'settings')).toBe(false);
  });

  test('should redirect anonymous users from member-specific routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      profile: null,
      role: 'anonymous'
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['member']}>
          <div>Member Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should allow member role to access routes with member role requirement', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'member' },
      profile: { id: '123', role: 'member' },
      role: 'member'
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['member']}>
          <div>Member Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Member Content')).toBeInTheDocument();
  });
});
