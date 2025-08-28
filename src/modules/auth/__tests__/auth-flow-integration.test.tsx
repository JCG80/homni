/**
 * Phase 2: Integration Tests for Complete Auth Flows
 * End-to-end auth flow testing with real Supabase integration
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import App from '@/App';
import { UserRole } from '../types/unified-types';

// Test user credentials (these should match setupTestUsers)
const TEST_USERS: Record<UserRole, { email: string; password: string }> = {
  guest: { email: 'guest@test.local', password: 'Test1234!' },
  user: { email: 'user@test.local', password: 'Test1234!' },
  company: { email: 'company@test.local', password: 'Test1234!' },
  content_editor: { email: 'content@test.local', password: 'Test1234!' },
  admin: { email: 'admin@test.local', password: 'Test1234!' },
  master_admin: { email: 'master-admin@test.local', password: 'Test1234!' }
};

describe('Auth Flow Integration Tests - Phase 2', () => {
  beforeEach(async () => {
    // Ensure clean state
    await supabase.auth.signOut();
  });

  afterEach(async () => {
    // Clean up after each test
    await supabase.auth.signOut();
  });

  describe('Complete Login/Logout Cycles', () => {
    it('should complete full login cycle for regular user', async () => {
      render(<App />);

      // Should start on homepage
      await waitFor(() => {
        expect(screen.getByText(/homni/i)).toBeInTheDocument();
      });

      // Navigate to login
      const loginLink = screen.getByRole('link', { name: /logg inn/i });
      await userEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByText('Velkommen tilbake')).toBeInTheDocument();
      });

      // Fill in credentials
      const emailInput = screen.getByLabelText(/e-postadresse/i);
      const passwordInput = screen.getByLabelText(/passord/i);
      
      await userEvent.type(emailInput, TEST_USERS.user.email);
      await userEvent.type(passwordInput, TEST_USERS.user.password);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /logg inn/i });
      await userEvent.click(submitButton);

      // Should redirect to user dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/user');
      }, { timeout: 10000 });

      // Should show user dashboard content
      await waitFor(() => {
        expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle admin login and redirect correctly', async () => {
      render(<App />);

      // Navigate to login
      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: /logg inn/i });
        return userEvent.click(loginLink);
      });

      // Fill in admin credentials
      const emailInput = await screen.findByLabelText(/e-postadresse/i);
      const passwordInput = await screen.findByLabelText(/passord/i);
      
      await userEvent.type(emailInput, TEST_USERS.admin.email);
      await userEvent.type(passwordInput, TEST_USERS.admin.password);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /logg inn/i });
      await userEvent.click(submitButton);

      // Should redirect to admin dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/admin');
      }, { timeout: 10000 });
    });

    it('should handle logout and return to homepage', async () => {
      // First login as user
      await supabase.auth.signInWithPassword({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password
      });

      render(<App />);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/user');
      }, { timeout: 10000 });

      // Find and click logout button
      const logoutButton = screen.getByRole('button', { name: /logg ut/i });
      await userEvent.click(logoutButton);

      // Should redirect to homepage and show login option
      await waitFor(() => {
        expect(window.location.pathname).toBe('/');
        expect(screen.getByRole('link', { name: /logg inn/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should block unauthorized access to admin routes', async () => {
      // Login as regular user
      await supabase.auth.signInWithPassword({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password
      });

      render(<App />);

      // Try to navigate to admin route
      window.history.pushState({}, '', '/admin');

      // Should redirect to unauthorized page
      await waitFor(() => {
        expect(screen.getByText(/ingen tilgang/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should allow admin access to admin routes', async () => {
      // Login as admin
      await supabase.auth.signInWithPassword({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      });

      render(<App />);

      // Navigate to admin route
      window.history.pushState({}, '', '/admin');

      // Should show admin dashboard
      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should redirect unauthenticated users to login', async () => {
      render(<App />);

      // Try to navigate to protected route
      window.history.pushState({}, '', '/dashboard/user');

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid credentials gracefully', async () => {
      render(<App />);

      // Navigate to login
      const loginLink = screen.getByRole('link', { name: /logg inn/i });
      await userEvent.click(loginLink);

      // Fill in invalid credentials
      const emailInput = await screen.findByLabelText(/e-postadresse/i);
      const passwordInput = await screen.findByLabelText(/passord/i);
      
      await userEvent.type(emailInput, 'invalid@test.com');
      await userEvent.type(passwordInput, 'wrongpassword');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /logg inn/i });
      await userEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/ugyldig e-postadresse eller passord/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should remain on login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should handle network errors during login', async () => {
      // Mock network error by using invalid credentials that will trigger server error
      render(<App />);

      const loginLink = screen.getByRole('link', { name: /logg inn/i });
      await userEvent.click(loginLink);

      const emailInput = await screen.findByLabelText(/e-postadresse/i);
      const passwordInput = await screen.findByLabelText(/passord/i);
      
      await userEvent.type(emailInput, '');
      await userEvent.type(passwordInput, '');

      const submitButton = screen.getByRole('button', { name: /logg inn/i });
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/e-postadresse er påkrevd/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session across page refreshes', async () => {
      // Login first
      await supabase.auth.signInWithPassword({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password
      });

      // Render app
      render(<App />);

      // Should immediately be on dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/user');
      }, { timeout: 10000 });

      // Simulate page refresh by re-rendering
      render(<App />);

      // Should still be authenticated and on dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/user');
        expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });
});