
import { describe, test, expect, beforeEach } from 'vitest';
import { determineUserRole } from '../utils/roles/determination';

describe('Auth role determination', () => {
  test('should correctly identify user role from metadata', () => {
    // Mock user data with role in metadata
    const mockUserData = {
      user: {
        user_metadata: { role: 'user' },
        email: 'user@homni.no'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('user');
  });

  test('should correctly identify company role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'company' },
        email: 'company@homni.no'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('company');
  });

  test('should correctly identify admin role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'admin' },
        email: 'admin@homni.no'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('admin');
  });

  test('should correctly identify master_admin role from metadata', () => {
    const mockUserData = {
      user: {
        user_metadata: { role: 'master_admin' },
        email: 'master@homni.no'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('master_admin');
  });

  test('should default to user role if no role is specified', () => {
    const mockUserData = {
      user: {
        user_metadata: {},
        email: 'no-role@homni.no'
      }
    };
    
    expect(determineUserRole(mockUserData)).toBe('user');
  });

  test('should recognize development test users by email', () => {
    // In development mode, these emails should map to specific roles
    const adminUserData = { user: { email: 'admin@homni.no', user_metadata: {} } };
    const companyUserData = { user: { email: 'company@homni.no', user_metadata: {} } };
    const regularUserData = { user: { email: 'user@homni.no', user_metadata: {} } };
    
    // We have to mock import.meta.env.MODE for these tests
    // This is a simplification that assumes development mode
    const originalMode = import.meta.env.MODE;
    import.meta.env.MODE = 'development';
    
    expect(determineUserRole(adminUserData)).toBe('master_admin');
    expect(determineUserRole(companyUserData)).toBe('company');
    expect(determineUserRole(regularUserData)).toBe('user');
    
    // Restore the original mode
    import.meta.env.MODE = originalMode;
  });
});
