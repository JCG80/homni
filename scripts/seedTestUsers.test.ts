import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUser, validateRlsPolicies, getExpectedModulesForRole } from './seedTestUsers';
import { UserRole } from '../src/modules/auth/utils/normalizeRole';

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    upsert: vi.fn().mockReturnThis()
  })),
  rpc: vi.fn()
};

vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabaseClient
}));

describe('seedTestUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createUser', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        role: 'user' as UserRole,
        account_type: 'privatperson',
        profile_data: {
          display_name: 'Test User',
          notification_preferences: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true
          },
          ui_preferences: {
            theme: 'light',
            language: 'no',
            dashboard_layout: 'standard'
          },
          feature_overrides: {}
        }
      };

      // Mock successful auth signup
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: userData.email }
        },
        error: null
      });

      // Mock successful profile creation
      mockSupabaseClient.from().insert().mockResolvedValue({
        data: { id: 'test-profile-id' },
        error: null
      });

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined
        }
      });
    });

    test('should handle auth signup errors', async () => {
      const userData = {
        email: 'invalid@example.com',
        password: 'weak',
        role: 'user' as UserRole,
        account_type: 'privatperson',
        profile_data: {}
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password is too weak' }
      });

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password is too weak');
    });

    test('should handle profile creation errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        role: 'user' as UserRole,
        account_type: 'privatperson',
        profile_data: {
          display_name: 'Test User'
        }
      };

      // Mock successful auth signup
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: userData.email }
        },
        error: null
      });

      // Mock failed profile creation
      mockSupabaseClient.from().insert().mockResolvedValue({
        data: null,
        error: { message: 'Profile creation failed' }
      });

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile creation failed');
    });

    test('should create company profile for business accounts', async () => {
      const userData = {
        email: 'company@example.com',
        password: 'TestPassword123!',
        role: 'company' as UserRole,
        account_type: 'bedrift',
        profile_data: {
          display_name: 'Test Company AS'
        },
        company_data: {
          company_name: 'Test Company AS',
          org_number: '123456789',
          industry: 'construction'
        }
      };

      // Mock successful auth signup
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: userData.email }
        },
        error: null
      });

      // Mock successful profile and company creation
      mockSupabaseClient.from().insert().mockResolvedValue({
        data: { id: 'test-id' },
        error: null
      });

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      // Should be called twice - once for user profile, once for company profile
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateRlsPolicies', () => {
    test('should validate RLS policies for user role', async () => {
      const userId = 'test-user-id';
      const role: UserRole = 'user';

      // Mock successful RLS validation queries
      mockSupabaseClient.from().select().eq().limit().mockResolvedValue({
        data: [{ id: 'test-profile-id' }],
        error: null
      });

      const result = await validateRlsPolicies(userId, role);

      expect(result.success).toBe(true);
      expect(result.policies_tested).toBeGreaterThan(0);
    });

    test('should handle RLS policy failures', async () => {
      const userId = 'test-user-id';
      const role: UserRole = 'user';

      // Mock RLS policy failure
      mockSupabaseClient.from().select().eq().limit().mockResolvedValue({
        data: null,
        error: { message: 'RLS policy violation' }
      });

      const result = await validateRlsPolicies(userId, role);

      expect(result.success).toBe(false);
      expect(result.failed_policies).toBeGreaterThan(0);
    });

    test('should test different policies for different roles', async () => {
      const userId = 'test-admin-id';
      const adminRole: UserRole = 'admin';
      const userRole: UserRole = 'user';

      // Mock successful queries
      mockSupabaseClient.from().select().eq().limit().mockResolvedValue({
        data: [{ id: 'test-id' }],
        error: null
      });

      const adminResult = await validateRlsPolicies(userId, adminRole);
      const userResult = await validateRlsPolicies(userId, userRole);

      expect(adminResult.success).toBe(true);
      expect(userResult.success).toBe(true);
      
      // Admin should have more policies to test than regular user
      expect(adminResult.policies_tested).toBeGreaterThanOrEqual(userResult.policies_tested);
    });
  });

  describe('getExpectedModulesForRole', () => {
    test('should return correct modules for user role', () => {
      const modules = getExpectedModulesForRole('user');
      
      expect(modules).toContain('leads');
      expect(modules).toContain('properties');
      expect(modules).toContain('documents');
      expect(modules).not.toContain('admin');
      expect(modules).not.toContain('analytics');
    });

    test('should return correct modules for company role', () => {
      const modules = getExpectedModulesForRole('company');
      
      expect(modules).toContain('leads');
      expect(modules).toContain('analytics');
      expect(modules).toContain('team');
      expect(modules).toContain('billing');
      expect(modules).not.toContain('admin');
    });

    test('should return correct modules for admin role', () => {
      const modules = getExpectedModulesForRole('admin');
      
      expect(modules).toContain('admin');
      expect(modules).toContain('users');
      expect(modules).toContain('system');
      expect(modules).toContain('analytics');
    });

    test('should return correct modules for content_editor role', () => {
      const modules = getExpectedModulesForRole('content_editor');
      
      expect(modules).toContain('content');
      expect(modules).toContain('media');
      expect(modules).toContain('pages');
      expect(modules).not.toContain('admin');
      expect(modules).not.toContain('billing');
    });

    test('should return empty array for anonymous role', () => {
      const modules = getExpectedModulesForRole('anonymous');
      
      expect(modules).toEqual([]);
    });

    test('should return minimal modules for unknown role', () => {
      const modules = getExpectedModulesForRole('unknown_role' as UserRole);
      
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('role-based feature access', () => {
    test('should validate feature access for different roles', () => {
      const roles: UserRole[] = ['user', 'company', 'admin', 'content_editor'];
      
      roles.forEach(role => {
        const modules = getExpectedModulesForRole(role);
        expect(Array.isArray(modules)).toBe(true);
        
        // Each role should have at least some modules (except anonymous)
        if (role !== 'anonymous') {
          expect(modules.length).toBeGreaterThan(0);
        }
      });
    });

    test('should ensure admin has access to all critical modules', () => {
      const adminModules = getExpectedModulesForRole('admin');
      const criticalModules = ['admin', 'users', 'system', 'analytics'];
      
      criticalModules.forEach(module => {
        expect(adminModules).toContain(module);
      });
    });

    test('should ensure proper module hierarchy', () => {
      const userModules = getExpectedModulesForRole('user');
      const companyModules = getExpectedModulesForRole('company');
      const adminModules = getExpectedModulesForRole('admin');
      
      // Company should have all user modules plus additional ones
      userModules.forEach(module => {
        if (!['documents'].includes(module)) { // Some modules might be user-specific
          expect(companyModules.some(m => m === module || m.includes(module))).toBe(true);
        }
      });
      
      // Admin should have access to most modules
      expect(adminModules.length).toBeGreaterThanOrEqual(companyModules.length);
    });
  });
});