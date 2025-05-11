
import { describe, test, expect, beforeEach } from 'vitest';
import { determineUserRole } from '../utils/roles/determination';

describe('Auth role determination', () => {
  test('should correctly identify user role from metadata', () => {
    // Mock user data with role in metadata
    const mockUserData = {
      user: {
        user_metadata: { role: 'member' },
        email: 'user@test.local'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('member');
  });

  test('should correctly identify company role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'company' },
        email: 'company@test.local'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('company');
  });

  test('should correctly identify admin role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'admin' },
        email: 'admin@test.local'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('admin');
  });

  test('should correctly identify master_admin role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'master_admin' },
        email: 'master-admin@test.local'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('master_admin');
  });

  test('should default to member role if no role is specified', () => {
    const mockUserData = {
      user: {
        user_metadata: {},
        email: 'no-role@test.local'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('member');
  });

  test('should recognize development test users by email', () => {
    // In development mode, these emails should map to specific roles
    const adminUserData = { user: { email: 'admin@test.local', user_metadata: {} } };
    const companyUserData = { user: { email: 'company@test.local', user_metadata: {} } };
    const providerUserData = { user: { email: 'provider@test.local', user_metadata: {} } };
    const regularUserData = { user: { email: 'user@test.local', user_metadata: {} } };
    
    // We have to mock import.meta.env.MODE for these tests
    // This is a simplification that assumes development mode
    const originalMode = import.meta.env.MODE;
    import.meta.env.MODE = 'development';
    
    expect(determineUserRole(adminUserData)).toBe('master_admin');
    expect(determineUserRole(companyUserData)).toBe('company');
    expect(determineUserRole(providerUserData)).toBe('provider');
    expect(determineUserRole(regularUserData)).toBe('member');
    
    // Restore the original mode
    import.meta.env.MODE = originalMode;
  });
});
