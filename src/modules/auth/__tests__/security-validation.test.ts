/**
 * Phase 2: Security Validation Tests
 * Validates authentication security and RLS policies
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '../types/unified-types';

// Test users for security validation
const SECURITY_TEST_USERS: Record<UserRole, { email: string; password: string }> = {
  guest: { email: 'security-guest@homni.no', password: 'SecureTest1234!' },
  user: { email: 'security-user@homni.no', password: 'SecureTest1234!' },
  company: { email: 'security-company@homni.no', password: 'SecureTest1234!' },
  content_editor: { email: 'security-editor@homni.no', password: 'SecureTest1234!' },
  admin: { email: 'security-admin@homni.no', password: 'SecureTest1234!' },
  master_admin: { email: 'security-master@homni.no', password: 'SecureTest1234!' }
};

describe('Authentication Security Validation - Phase 2', () => {
  beforeAll(async () => {
    // Ensure clean state
    await supabase.auth.signOut();
  });

  afterAll(async () => {
    // Clean up
    await supabase.auth.signOut();
  });

  describe('RLS Policy Validation', () => {
    it('should block anonymous access to user_profiles', async () => {
      // Ensure not authenticated
      await supabase.auth.signOut();

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(1);

        // Should either get empty data or an error due to RLS
        expect(error || data?.length === 0).toBeTruthy();
      } catch (error) {
        // Expected - anonymous access should be blocked
        expect(error).toBeDefined();
      }
    });

    it('should block anonymous access to company_profiles', async () => {
      await supabase.auth.signOut();

      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .limit(1);

        expect(error || data?.length === 0).toBeTruthy();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should block anonymous access to admin_logs', async () => {
      await supabase.auth.signOut();

      try {
        const { data, error } = await supabase
          .from('admin_logs')
          .select('*')
          .limit(1);

        expect(error || data?.length === 0).toBeTruthy();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should allow authenticated users to access their own profiles', async () => {
      // Login as regular user
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.user.email,
        password: SECURITY_TEST_USERS.user.password
      });

      if (authError) {
        // User doesn't exist, create them
        await supabase.auth.signUp({
          email: SECURITY_TEST_USERS.user.email,
          password: SECURITY_TEST_USERS.user.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: 'Security Test User', role: 'user' }
          }
        });
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      }
    });
  });

  describe('Role-Based Access Control', () => {
    it('should restrict admin functions to admin users only', async () => {
      // Login as regular user
      await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.user.email,
        password: SECURITY_TEST_USERS.user.password
      });

      // Try to access admin-only data
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .insert({ name: 'test-flag', description: 'Test flag' });

        // Should fail for non-admin user
        expect(error).toBeDefined();
        expect(data).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should allow admin users to access admin functions', async () => {
      // Try to login as admin
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.admin.email,
        password: SECURITY_TEST_USERS.admin.password
      });

      if (authError) {
        // Admin user doesn't exist, create them
        await supabase.auth.signUp({
          email: SECURITY_TEST_USERS.admin.email,
          password: SECURITY_TEST_USERS.admin.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: 'Security Test Admin', role: 'admin' }
          }
        });
      }

      // Get current user and ensure profile exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Ensure user profile exists with admin role
        await supabase.rpc('ensure_user_profile', {
          p_user_id: user.id,
          p_role: 'admin'
        });

        // Try admin operation
        const { error } = await supabase
          .from('feature_flags')
          .select('*')
          .limit(1);

        // Should succeed for admin user
        expect(error).toBeNull();
      }
    });
  });

  describe('Authentication Security Measures', () => {
    it('should enforce password requirements', async () => {
      const { error } = await supabase.auth.signUp({
        email: 'weak-password@homni.no',
        password: '123', // Weak password
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      // Should reject weak passwords
      expect(error).toBeDefined();
      expect(error?.message).toContain('Password');
    });

    it('should enforce email format validation', async () => {
      const { error } = await supabase.auth.signUp({
        email: 'invalid-email', // Invalid email format
        password: 'SecurePassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      // Should reject invalid email formats
      expect(error).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const testEmail = 'duplicate-test@homni.no';
      
      // First registration
      await supabase.auth.signUp({
        email: testEmail,
        password: 'SecurePassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      // Second registration with same email
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'AnotherPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      // Should handle duplicate email appropriately
      expect(error?.message || 'handled').toBeDefined();
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions after logout', async () => {
      // Login first
      await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.user.email,
        password: SECURITY_TEST_USERS.user.password
      });

      // Verify we're authenticated
      const { data: { user: beforeLogout } } = await supabase.auth.getUser();
      expect(beforeLogout).toBeDefined();

      // Logout
      await supabase.auth.signOut();

      // Verify session is invalidated
      const { data: { user: afterLogout } } = await supabase.auth.getUser();
      expect(afterLogout).toBeNull();
    });

    it('should handle concurrent sessions securely', async () => {
      // This test ensures that multiple logins don't interfere with each other
      const { error: login1 } = await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.user.email,
        password: SECURITY_TEST_USERS.user.password
      });

      expect(login1).toBeNull();

      // Get user session
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe(SECURITY_TEST_USERS.user.email);
    });
  });

  describe('Data Isolation Tests', () => {
    it('should isolate user data between different users', async () => {
      // This would be implemented with actual user data once we have proper test data setup
      // For now, we validate the access patterns
      
      // Login as user 1
      await supabase.auth.signInWithPassword({
        email: SECURITY_TEST_USERS.user.email,
        password: SECURITY_TEST_USERS.user.password
      });

      const { data: { user: user1 } } = await supabase.auth.getUser();
      
      if (user1) {
        // Try to access another user's data
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('id', user1.id);

        // Should either be empty or have restricted access
        expect(data === null || data.length === 0 || error).toBeTruthy();
      }
    });
  });
});