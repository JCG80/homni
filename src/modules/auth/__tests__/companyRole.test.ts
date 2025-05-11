
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
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
  };
});

describe('Company Role Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should allow company role to access company-specific modules', () => {
    expect(canAccessModule('company', 'dashboard')).toBe(true);
    expect(canAccessModule('company', 'leads')).toBe(true);
    expect(canAccessModule('company', 'company')).toBe(true);
    expect(canAccessModule('company', 'company/profile')).toBe(true);
    expect(canAccessModule('company', 'settings')).toBe(true);
    expect(canAccessModule('company', 'reports')).toBe(true);
    expect(canAccessModule('company', 'profile')).toBe(true);
  });

  test('should not allow company role to access user-specific or admin modules', () => {
    expect(canAccessModule('company', 'maintenance')).toBe(false);
    expect(canAccessModule('company', 'properties')).toBe(false);
    expect(canAccessModule('company', 'admin')).toBe(false);
    expect(canAccessModule('company', 'content')).toBe(false);
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
      role: 'company'
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

  test('should redirect user role from company-specific routes', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '123', role: 'user' },
      profile: { id: '123', role: 'user' },
      role: 'user'
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
