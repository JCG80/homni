
/**
 * Type guards and validation functions for roles
 */
import { UserRole, ALL_ROLES } from './types';

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: any): value is UserRole {
  return ALL_ROLES.includes(value as UserRole) || value === 'anonymous';
}

/**
 * Check if a user has at least one of the required roles
 */
export function hasRequiredRole(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}

/**
 * Determine if a role has admin privileges
 */
export function isAdminRole(role: UserRole | null): boolean {
  if (!role) return false;
  return ['admin', 'master_admin'].includes(role);
}

/**
 * Determine if a role has content editor privileges
 */
export function isContentEditorRole(role: UserRole | null): boolean {
  if (!role) return false;
  return ['admin', 'master_admin'].includes(role);
}
