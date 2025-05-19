
import { UserRole } from '../../types/unified-types';
import { ALL_ROLES } from './types';

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: any): value is UserRole {
  return ALL_ROLES.includes(value);
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidRole(role: string): boolean {
  return isUserRole(role);
}

/**
 * Check if the user has access to a specific module
 */
export function canAccessModule(userRole: UserRole | string | null, moduleId: string): boolean {
  // Basic implementation - can be enhanced with actual module access logic
  // For now, admin and master_admin can access all modules
  if (!userRole) return false;
  
  if (userRole === 'admin' || userRole === 'master_admin') {
    return true;
  }
  
  // Add module-specific access checks here
  return false;
}

/**
 * Check if a user can access a specific path based on their role
 */
export function canAccessPath(userRole: UserRole | null, path: string): boolean {
  if (!userRole) return false;
  
  // Admin and master_admin can access all paths
  if (userRole === 'admin' || userRole === 'master_admin') {
    return true;
  }
  
  // Add path-specific access checks here
  return true;
}

/**
 * Check if a user has the required role to access a resource
 */
export function hasRequiredRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: UserRole | null): boolean {
  return role === 'admin' || role === 'master_admin';
}

/**
 * Check if a role is a content editor role
 */
export function isContentEditorRole(role: UserRole | null): boolean {
  return role === 'content_editor';
}

/**
 * Get allowed paths for a specific role
 */
export function getAllowedPathsForRole(role: UserRole | null): string[] {
  if (!role) return ['/login', '/register'];
  
  // Common paths for all authenticated users
  const commonPaths = ['/dashboard', '/profile'];
  
  switch (role) {
    case 'admin':
    case 'master_admin':
      return [...commonPaths, '/admin', '/settings'];
    case 'company':
      return [...commonPaths, '/company'];
    case 'content_editor':
      return [...commonPaths, '/content'];
    case 'member':
      return [...commonPaths];
    default:
      return ['/login', '/register'];
  }
}
