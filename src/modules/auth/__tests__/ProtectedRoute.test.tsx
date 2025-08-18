
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../types/types';

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

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should show loading state when authentication is loading', () => {
    (useAuth as any).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      role: null
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Sjekker tilgangsrettigheter...')).toBeInTheDocument();
  });

  test('should redirect to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: 'anonymous' as UserRole
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should render children when user is authenticated and no specific roles are required', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user' as UserRole,
      canAccessModule: vi.fn(),
      hasRole: vi.fn()
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  test('should render children when user has the required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'admin' as UserRole,
      canAccessModule: vi.fn(),
      hasRole: vi.fn().mockReturnValue(true)
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  test('should redirect to unauthorized when user does not have the required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user' as UserRole,
      canAccessModule: vi.fn(),
      hasRole: vi.fn().mockReturnValue(false)
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });

  test('should render children when allowAnyAuthenticated is true', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user' as UserRole, // Any role will do
      canAccessModule: vi.fn(),
      hasRole: vi.fn()
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute allowAnyAuthenticated={true}>
          <div>Authenticated Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Authenticated Content')).toBeInTheDocument();
  });

  test('should allow anonymous users to access allowed modules', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: 'anonymous' as UserRole,
      canAccessModule: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(false)
    });

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute module="home">
          <div>Public Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Public Content')).toBeInTheDocument();
  });

  test('should redirect anonymous users from protected modules', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: 'anonymous' as UserRole,
      canAccessModule: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false)
    });

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute module="dashboard">
          <div>Protected Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });
});
