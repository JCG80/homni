import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserDashboard from '../UserDashboard';
import { createMockAuthContext } from '@/test/factories/userFactory';

// Mock the auth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock the properties hook
vi.mock('@/modules/property/hooks/useProperties', () => ({
  useProperties: vi.fn(() => ({
    properties: [],
    isLoading: false,
    error: null
  }))
}));

// Mock the leads hook
vi.mock('@/modules/leads/hooks/useMyLeads', () => ({
  useMyLeads: vi.fn(() => ({
    leads: [],
    isLoading: false,
    error: null
  }))
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>
  };
});

const renderUserDashboard = (authContext = createMockAuthContext()) => {
  const { useAuth } = require('@/modules/auth/hooks/useAuth');
  useAuth.mockReturnValue(authContext);

  return render(
    <BrowserRouter>
      <UserDashboard />
    </BrowserRouter>
  );
};

describe('UserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if not authenticated', () => {
    renderUserDashboard(createMockAuthContext({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      profile: null
    }));

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
  });

  it('redirects to dashboard if user has wrong role', () => {
    renderUserDashboard(createMockAuthContext({
      profile: createMockAuthContext().profile ? {
        ...createMockAuthContext().profile!,
        role: 'company'
      } : null
    }));

    expect(screen.getByTestId('navigate')).toHaveTextContent('/dashboard');
  });

  it('shows loading state', () => {
    renderUserDashboard(createMockAuthContext({
      isLoading: true
    }));

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard for authenticated user', async () => {
    renderUserDashboard(createMockAuthContext({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: {
        id: 'test-profile',
        full_name: 'Test User',
        role: 'user',
        email: 'test@example.com'
      }
    }));

    await waitFor(() => {
      expect(screen.getByText(/Velkommen, Test User/)).toBeInTheDocument();
    });

    expect(screen.getByText('Mine Eiendommer')).toBeInTheDocument();
    expect(screen.getByText('Mine Forespørsler')).toBeInTheDocument();
    expect(screen.getByText('Min Profil')).toBeInTheDocument();
  });

  it('shows user email if no full name', async () => {
    renderUserDashboard(createMockAuthContext({
      user: { id: 'test-user', email: 'test@example.com' },
      profile: {
        id: 'test-profile',
        full_name: '',
        role: 'user',
        email: 'test@example.com'
      }
    }));

    await waitFor(() => {
      expect(screen.getByText(/Velkommen, test@example.com/)).toBeInTheDocument();
    });
  });

  it('includes proper SEO meta tags', () => {
    renderUserDashboard();

    // Check that Helmet sets the correct title
    expect(document.title).toContain('Min Dashboard - Homni');
  });

  it('renders quick actions for user workflow', async () => {
    renderUserDashboard();

    await waitFor(() => {
      expect(screen.getByText('Ny eiendom')).toBeInTheDocument();
    });
    expect(screen.getByText('Send forespørsel')).toBeInTheDocument();
  });
});