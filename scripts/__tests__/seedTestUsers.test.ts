
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createUser, validateRlsPolicies, getExpectedModulesForRole, type CreateUserResult, type RlsValidationResult } from '../seedTestUsers';
import { UserRole } from '../../src/modules/auth/normalizeRole';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ 
      data: { id: 'test-profile-id' }, 
      error: null 
    }),
    insert: vi.fn().mockResolvedValue({ 
      data: { id: 'test-profile-id' }, 
      error: null 
    }),
    update: vi.fn().mockResolvedValue({ 
      data: { id: 'test-profile-id' }, 
      error: null 
    })
  });
  
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      },
      from: mockFrom
    })
  };
});

// Mock the supabase client from lib
vi.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 'test-profile-id' }, 
        error: null 
      }),
      insert: vi.fn().mockResolvedValue({ 
        data: { id: 'test-profile-id' }, 
        error: null 
      }),
      update: vi.fn().mockResolvedValue({ 
        data: { id: 'test-profile-id' }, 
        error: null 
      })
    })
  }
}));

// Mock console.log and console.error to clean up test output
vi.mock('console', () => {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  };
});

describe('seedTestUsers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  test('getExpectedModulesForRole returns correct modules for each role', () => {
    expect(getExpectedModulesForRole('master_admin')).toEqual(['admin', 'users', 'system', 'analytics', 'content', 'properties', 'profile', 'billing', 'team']);
    expect(getExpectedModulesForRole('admin')).toEqual(['admin', 'users', 'system', 'analytics', 'content', 'properties', 'profile']);
    expect(getExpectedModulesForRole('company')).toEqual(['leads', 'analytics', 'team', 'billing', 'properties', 'profile']);
    expect(getExpectedModulesForRole('content_editor')).toEqual(['content', 'media', 'pages', 'profile']);
    expect(getExpectedModulesForRole('user')).toEqual(['leads', 'properties', 'documents', 'profile']);
    expect(getExpectedModulesForRole('guest')).toEqual([]);
    expect(getExpectedModulesForRole('unknown' as UserRole)).toEqual([]);
  });
  
  test('validateRlsPolicies checks appropriate access for roles', async () => {
    // Since we can't easily test actual RLS policies in a unit test,
    // we'll just verify the function runs and returns the correct result structure with our mocks
    const result = await validateRlsPolicies('test-id-123', 'user');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('policies_tested');
    expect(result).toHaveProperty('failed_policies');
    expect(result).toHaveProperty('errors');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.policies_tested).toBe('number');
    expect(typeof result.failed_policies).toBe('number');
    expect(Array.isArray(result.errors)).toBe(true);
  });
  
  test('createUser creates appropriate profiles for different roles', async () => {
    // Create test user data that matches the TestUser interface
    const testUserData = {
      email: 'test@example.com',
      password: 'TestUser123!',
      role: 'user' as UserRole,
      account_type: 'privatperson' as const,
      profile_data: {
        display_name: 'Test User',
        notification_preferences: { email: true, sms: false, push: false, marketing: false, system: true },
        ui_preferences: { theme: 'light', language: 'no', dashboard_layout: 'standard', preferred_modules: [], quick_actions: [] },
        feature_overrides: {}
      }
    };
    
    const result = await createUser(testUserData);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('user_id');
    expect(result).toHaveProperty('profile_id');
    expect(typeof result.success).toBe('boolean');
    
    // Test company role which needs additional profile
    const companyUserData = {
      email: 'company@example.com',
      password: 'TestCompany123!',
      role: 'company' as UserRole,
      account_type: 'bedrift' as const,
      profile_data: {
        display_name: 'Test Company',
        notification_preferences: { email: true, sms: true, push: true, marketing: true, system: true },
        ui_preferences: { theme: 'light', language: 'no', dashboard_layout: 'professional', preferred_modules: [], quick_actions: [] },
        feature_overrides: {}
      },
      company_data: {
        company_name: 'Test Company AS',
        org_number: '123456789',
        industry: 'test',
        size: 'small',
        subscription_tier: 'basic'
      }
    };
    
    const companyResult = await createUser(companyUserData);
    expect(companyResult).toHaveProperty('success');
    expect(companyResult).toHaveProperty('user_id');
    expect(companyResult).toHaveProperty('profile_id');
    expect(companyResult).toHaveProperty('company_id');
  });
});
