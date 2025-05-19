
import { describe, test, expect } from 'vitest';
import { getRoleDisplayName } from '../utils/roles/display';
import { getRolePermissions, getAllowedModulesForRole } from '../utils/roles/permissions';
import { UserRole } from '../utils/roles/types';

describe('Role Helper Functions', () => {
  describe('getRoleDisplayName', () => {
    test('returns correct display name for each role', () => {
      expect(getRoleDisplayName('anonymous' as UserRole)).toBe('Anonym');
      expect(getRoleDisplayName('member' as UserRole)).toBe('Bruker');
      expect(getRoleDisplayName('company' as UserRole)).toBe('Bedrift');
      expect(getRoleDisplayName('admin' as UserRole)).toBe('Administrator');
      expect(getRoleDisplayName('master_admin' as UserRole)).toBe('Hovedadministrator');
      expect(getRoleDisplayName('content_editor' as UserRole)).toBe('Innholdsredaktør');
    });

    test('returns the original role if no mapping exists', () => {
      expect(getRoleDisplayName('unknown_role' as UserRole)).toBe('unknown_role');
    });

    test('handles null role gracefully', () => {
      expect(getRoleDisplayName(null)).toBe('Unknown');
    });
  });

  describe('getRolePermissions', () => {
    test('returns correct permissions for admin roles', () => {
      const adminPermissions = getRolePermissions('admin' as UserRole);
      const masterAdminPermissions = getRolePermissions('master_admin' as UserRole);
      
      expect(adminPermissions.canView).toBe(true);
      expect(adminPermissions.canEdit).toBe(true);
      expect(adminPermissions.canDelete).toBe(true);
      expect(adminPermissions.canCreate).toBe(true);
      
      expect(masterAdminPermissions).toEqual(adminPermissions);
    });

    test('returns correct permissions for content editor role', () => {
      const permissions = getRolePermissions('content_editor' as UserRole);
      
      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canDelete).toBe(false);
    });

    test('returns correct permissions for company role', () => {
      const permissions = getRolePermissions('company' as UserRole);
      
      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canDelete).toBe(false);
    });

    test('returns correct permissions for member role', () => {
      const permissions = getRolePermissions('member' as UserRole);
      
      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canCreate).toBe(true);
    });

    test('returns restricted permissions for anonymous role', () => {
      const permissions = getRolePermissions('anonymous' as UserRole);
      
      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canCreate).toBe(false);
    });

    test('handles null role gracefully', () => {
      const permissions = getRolePermissions(null);
      
      expect(permissions.canView).toBe(false);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canCreate).toBe(false);
    });
  });

  describe('getAllowedModulesForRole', () => {
    test('returns correct modules for each role', () => {
      expect(getAllowedModulesForRole('anonymous' as UserRole)).toContain('login');
      expect(getAllowedModulesForRole('member' as UserRole)).toContain('dashboard');
      expect(getAllowedModulesForRole('company' as UserRole)).toContain('company');
      expect(getAllowedModulesForRole('admin' as UserRole)).toContain('admin');
      expect(getAllowedModulesForRole('content_editor' as UserRole)).toContain('content');
    });

    test('master_admin has access to all modules via wildcard', () => {
      const modules = getAllowedModulesForRole('master_admin' as UserRole);
      expect(modules).toContain('*');
      expect(modules.length).toBe(1);
    });

    test('returns empty array for unknown roles', () => {
      const modules = getAllowedModulesForRole('unknown' as UserRole);
      expect(modules).toEqual([]);
    });
  });
});
