
import { describe, test, expect } from 'vitest';
import { canAccessModule } from '../utils/roles';
import { UserRole } from '../utils/roles/types';

describe('Anonymous Role Access', () => {
  test('should allow anonymous users to access public modules', () => {
    expect(canAccessModule('guest' as UserRole, 'home')).toBe(true);
    expect(canAccessModule('guest' as UserRole, 'leads/submit')).toBe(true);
    expect(canAccessModule('guest' as UserRole, 'info')).toBe(true);
  });

  test('should not allow anonymous users to access protected modules', () => {
    expect(canAccessModule('guest' as UserRole, 'dashboard')).toBe(false);
    expect(canAccessModule('guest' as UserRole, 'admin')).toBe(false);
    expect(canAccessModule('guest' as UserRole, 'content')).toBe(false);
  });

  test('should allow member role to access user-specific modules', () => {
    expect(canAccessModule('user', 'dashboard')).toBe(true);
    expect(canAccessModule('user', 'leads')).toBe(true);
  });

  test('should preserve existing role functionality', () => {
    expect(canAccessModule('admin', 'admin')).toBe(true);
    expect(canAccessModule('admin', 'leads')).toBe(true);
    expect(canAccessModule('company', 'leads')).toBe(true);
    expect(canAccessModule('master_admin', 'anything')).toBe(true); // Has access to everything with '*'
  });
});
