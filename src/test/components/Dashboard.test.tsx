import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock the route config
vi.mock('@/config/routeForRole', () => ({
  routeForRole: (role: string) => {
    const routes: Record<string, string> = {
      user: '/dashboard/user',
      company: '/dashboard/company',
      admin: '/dashboard/admin',
      master_admin: '/dashboard/admin',
      content_editor: '/dashboard/content-editor'
    };
    return routes[role] || '/';
  }
}));

// Mock react-router-dom Navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate-to">{to}</div>;
    }
  };
});

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      role: null,
      user: null
    });

    renderDashboard();

    expect(screen.getByText('Laster inn dashboard...')).toBeInTheDocument();
    expect(screen.getByText('Sjekker tilgangsnivå')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: null,
      user: null
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
    });
  });

  it('redirects authenticated users without role to login', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: null,
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects user role to user dashboard', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'user',
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/user');
    });
  });

  it('redirects admin role to admin dashboard', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'admin',
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin');
    });
  });

  it('redirects company role to company dashboard', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'company',
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/company');
    });
  });

  it('redirects master_admin role to admin dashboard', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'master_admin',
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin');
    });
  });

  it('redirects content_editor role to content editor dashboard', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'content_editor',
      user: { id: '123' }
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/content-editor');
    });
  });
});