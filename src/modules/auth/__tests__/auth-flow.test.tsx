/**
 * Phase 2: Auth Flow Verification Tests
 * Comprehensive test suite for all authentication flows
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { LoginPage } from '@/pages/LoginPage';
import { AuthProvider } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '../types/unified-types';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    rpc: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Auth Flow Verification - Phase 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful session check
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow Tests', () => {
    it('should display login form for unauthenticated users', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Velkommen tilbake')).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
    });

    it('should handle successful login with correct role-based redirect', async () => {
      const mockSession = {
        user: { 
          id: '123', 
          email: 'admin@test.local',
          user_metadata: { role: 'admin' }
        }
      };

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Simulate successful auth state change
      const authCallback = (supabase.auth.onAuthStateChange as any).mock.calls[0][0];
      authCallback('SIGNED_IN', mockSession);

      await waitFor(() => {
        // Should redirect based on role
        expect(window.location.pathname).toBe('/admin');
      });
    });

    it('should handle login errors gracefully', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/e-postadresse/i);
      const passwordInput = screen.getByLabelText(/passord/i);
      const submitButton = screen.getByRole('button', { name: /logg inn/i });

      await userEvent.type(emailInput, 'invalid@test.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ugyldig e-postadresse eller passord/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Redirect Tests', () => {
    const roleRedirectTests: Array<{ role: UserRole; expectedPath: string }> = [
      { role: 'master_admin', expectedPath: '/admin' },
      { role: 'admin', expectedPath: '/admin' },
      { role: 'company', expectedPath: '/dashboard/company' },
      { role: 'content_editor', expectedPath: '/dashboard/content-editor' },
      { role: 'user', expectedPath: '/dashboard/user' },
      { role: 'guest', expectedPath: '/dashboard' }
    ];

    roleRedirectTests.forEach(({ role, expectedPath }) => {
      it(`should redirect ${role} to ${expectedPath}`, async () => {
        const mockSession = {
          user: { 
            id: '123', 
            email: `${role}@test.local`,
            user_metadata: { role }
          }
        };

        (supabase.auth.getSession as any).mockResolvedValue({
          data: { session: mockSession }
        });

        // Mock profile fetch
        (supabase.from as any).mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role, id: '123', full_name: `Test ${role}` },
                error: null
              })
            })
          })
        });

        render(
          <TestWrapper>
            <LoginPage />
          </TestWrapper>
        );

        // Simulate auth state change
        const authCallback = (supabase.auth.onAuthStateChange as any).mock.calls[0][0];
        authCallback('INITIAL_SESSION', mockSession);

        await waitFor(() => {
          expect(window.location.pathname).toBe(expectedPath);
        });
      });
    });
  });

  describe('Logout Flow Tests', () => {
    it('should handle logout and redirect to login page', async () => {
      const mockSession = {
        user: { id: '123', email: 'user@test.local' }
      };

      // Start with authenticated state
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      (supabase.auth.signOut as any).mockResolvedValue({
        error: null
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Simulate logout
      const authCallback = (supabase.auth.onAuthStateChange as any).mock.calls[0][0];
      authCallback('SIGNED_OUT', null);

      await waitFor(() => {
        // Should show login form again
        expect(screen.getByText('Velkommen tilbake')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Login Tests (Dev Mode)', () => {
    beforeEach(() => {
      // Mock dev environment
      vi.stubEnv('MODE', 'development');
    });

    it('should display quick login in development mode', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Developer Quick Login')).toBeInTheDocument();
      });
    });

    it('should handle quick login for all roles', async () => {
      const roles: UserRole[] = ['master_admin', 'admin', 'content_editor', 'company', 'user', 'guest'];

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      for (const role of roles) {
        const button = screen.getByTestId(`quicklogin-${role}`);
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      }
    });
  });

  describe('Session Persistence Tests', () => {
    it('should maintain session across page refreshes', async () => {
      const mockSession = {
        user: { id: '123', email: 'user@test.local' }
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });
    });

    it('should handle session expiration gracefully', async () => {
      // Simulate expired session
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Velkommen tilbake')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network errors during authentication', async () => {
      (supabase.auth.signInWithPassword as any).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/e-postadresse/i);
      const passwordInput = screen.getByLabelText(/passord/i);
      const submitButton = screen.getByRole('button', { name: /logg inn/i });

      await userEvent.type(emailInput, 'user@test.com');
      await userEvent.type(passwordInput, 'password');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/en feil oppstod/i)).toBeInTheDocument();
      });
    });

    it('should handle profile fetch errors', async () => {
      const mockSession = {
        user: { id: '123', email: 'user@test.local' }
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Profile fetch failed'))
          })
        })
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should still be loading or show error state
        expect(screen.queryByText('Verifiserer...')).toBeInTheDocument();
      });
    });
  });
});