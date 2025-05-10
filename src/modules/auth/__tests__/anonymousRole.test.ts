
import { describe, test, expect } from 'vitest';
import { canAccessModule } from '../utils/roles';

describe('Anonymous Role Access', () => {
  test('should allow anonymous users to access public modules', () => {
    expect(canAccessModule('anonymous', 'home')).toBe(true);
    expect(canAccessModule('anonymous', 'leads/submit')).toBe(true);
    expect(canAccessModule('anonymous', 'info')).toBe(true);
  });

  test('should not allow anonymous users to access protected modules', () => {
    expect(canAccessModule('anonymous', 'dashboard')).toBe(false);
    expect(canAccessModule('anonymous', 'admin')).toBe(false);
    expect(canAccessModule('anonymous', 'content')).toBe(false);
  });

  test('should allow user role to access user-specific modules', () => {
    expect(canAccessModule('user', 'dashboard')).toBe(true);
    expect(canAccessModule('user', 'leads')).toBe(true);
  });

  test('should preserve existing role functionality', () => {
    expect(canAccessModule('admin', 'admin')).toBe(true);
    expect(canAccessModule('admin', 'leads')).toBe(true);
    expect(canAccessModule('company', 'leads')).toBe(true);
    expect(canAccessModule('master-admin', 'anything')).toBe(false); // No direct match, but will pass with '*'
  });
});
