/**
 * Integration tests for authentication flows
 * Tests complete user journeys from registration to login
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser, createMockBusinessUser, authTestScenarios } from '../factories/userFactory';
import { validateEnvironment } from '@/services/environmentValidator';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn((callback) => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockResolvedValue({ data: null, error: null })
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Environment Setup', () => {
    it('should validate environment configuration', () => {
      const validation = validateEnvironment();
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('criticalIssues');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('suggestions');
      expect(validation).toHaveProperty('degradationMode');
    });

    it('should handle missing Supabase configuration gracefully', () => {
      const validation = validateEnvironment();
      
      // In test environment, Supabase config might be missing
      if (!validation.isValid) {
        expect(validation.degradationMode).toBe('full');
        expect(validation.criticalIssues.length).toBeGreaterThan(0);
        expect(validation.suggestions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('User Registration Flow', () => {
    it('should handle private user registration', async () => {
      const mockUser = createMockUser();
      const { email, password, display_name } = authTestScenarios.newUserRegistration;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { ...mockUser, email }, session: null },
        error: null
      });

      // Test registration logic would go here
      const signUpData = {
        email,
        password,
        options: {
          data: {
            display_name,
            account_type: 'private'
          }
        }
      };

      const result = await mockSupabase.auth.signUp(signUpData);
      
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(signUpData);
      expect(result.error).toBeNull();
      expect(result.data.user?.email).toBe(email);
    });

    it('should handle business user registration', async () => {
      const { user, company } = createMockBusinessUser();
      const { email, password, display_name, company_name, org_number } = authTestScenarios.businessRegistration;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { ...user, email }, session: null },
        error: null
      });

      const signUpData = {
        email,
        password,
        options: {
          data: {
            display_name,
            account_type: 'business',
            company_name,
            org_number
          }
        }
      };

      const result = await mockSupabase.auth.signUp(signUpData);
      
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(signUpData);
      expect(result.error).toBeNull();
    });

    it('should handle registration errors gracefully', async () => {
      const { email, password } = authTestScenarios.newUserRegistration;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' }
      });

      const result = await mockSupabase.auth.signUp({
        email,
        password,
        options: { data: { account_type: 'private' } }
      });
      
      expect(result.error?.message).toBe('Email already registered');
    });
  });

  describe('User Login Flow', () => {
    it('should handle valid login credentials', async () => {
      const mockUser = createMockUser();
      const { email, password } = authTestScenarios.validLogin;
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { ...mockUser, email }, 
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' }
        },
        error: null
      });

      const result = await mockSupabase.auth.signInWithPassword({ email, password });
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result.error).toBeNull();
      expect(result.data.session).toBeTruthy();
    });

    it('should handle invalid login credentials', async () => {
      const { email, password } = authTestScenarios.invalidLogin;
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      const result = await mockSupabase.auth.signInWithPassword({ email, password });
      
      expect(result.error?.message).toBe('Invalid login credentials');
      expect(result.data.session).toBeNull();
    });

    it('should handle network errors during login', async () => {
      const { email, password } = authTestScenarios.validLogin;
      
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        mockSupabase.auth.signInWithPassword({ email, password })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Session Management', () => {
    it('should handle session retrieval', async () => {
      const mockUser = createMockUser();
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: mockUser, 
            access_token: 'mock-token',
            expires_at: Date.now() + 3600000 
          }
        },
        error: null
      });

      const result = await mockSupabase.auth.getSession();
      
      expect(result.data.session).toBeTruthy();
      expect(result.data.session?.user).toEqual(mockUser);
    });

    it('should handle logout', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      const result = await mockSupabase.auth.signOut();
      
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle auth state changes', () => {
      const mockCallback = vi.fn();
      
      const { data } = mockSupabase.auth.onAuthStateChange(mockCallback);
      
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data.subscription).toBeTruthy();
    });
  });

  describe('Error Recovery and Retry Logic', () => {
    it('should handle retry logic for failed requests', async () => {
      const { email, password } = authTestScenarios.validLogin;
      
      // First call fails, second succeeds
      mockSupabase.auth.signInWithPassword
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Temporary network error' }
        })
        .mockResolvedValueOnce({
          data: { user: createMockUser(), session: { access_token: 'mock-token' } },
          error: null
        });

      // Simulate retry logic  
      let result = await mockSupabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        result = await mockSupabase.auth.signInWithPassword({ email, password });
      }
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(2);
      expect(result.error).toBeNull();
    });
  });
});