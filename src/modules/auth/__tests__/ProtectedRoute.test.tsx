
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Sjekker tilgangsrettigheter...')).toBeInTheDocument();
  });

  test('should redirect to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: null
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  test('should render children when user is authenticated and no specific roles are required', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user'
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should render children when user has the required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'admin'
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin', 'master-admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('should redirect to unauthorized when user does not have the required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user'
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin', 'master-admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });

  test('should render children when allowAnyAuthenticated is true', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user' // Any role will do
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowAnyAuthenticated={true}>
          <div>Authenticated Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
  });
});
