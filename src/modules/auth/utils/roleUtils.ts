
import { UserRole } from '../types/types';

/**
 * Checks if a user has at least one of the required roles
 */
export const hasRequiredRole = (userRole: UserRole | null, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

/**
 * Get a display name for a role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    'user': 'Bruker',
    'company': 'Bedrift',
    'admin': 'Administrator',
    'master-admin': 'Master Administrator',
    'provider': 'Tjenesteleverandør'
  };
  
  return displayNames[role] || role;
};

/**
 * Determines if a role has admin privileges
 */
export const isAdminRole = (role: UserRole | null): boolean => {
  if (!role) return false;
  return ['admin', 'master-admin'].includes(role);
};

/**
 * Checks if a role can access a specific module
 */
export const canAccessModule = (
  role: UserRole | null, 
  moduleName: string,
  moduleAccess: Record<string, UserRole[]> = {
    'leads': ['user', 'company', 'admin', 'master-admin'],
    'admin': ['admin', 'master-admin'],
    'company': ['company', 'admin', 'master-admin'],
    'geo': ['user', 'company', 'admin', 'master-admin', 'provider']
  }
): boolean => {
  if (!role) return false;
  
  // Master admin can access everything
  if (role === 'master-admin') return true;
  
  // Check if module has specific access rules
  const allowedRoles = moduleAccess[moduleName];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(role);
};

/**
 * Determine user role based on metadata or default to basic user
 */
export const determineUserRole = (metadata: Record<string, any> | null): UserRole => {
  if (!metadata || !metadata.role) {
    return 'user';
  }

  const role = metadata.role as string;
  
  // Validate if the role is a valid UserRole
  if (['user', 'company', 'admin', 'master-admin', 'provider'].includes(role)) {
    return role as UserRole;
  }
  
  return 'user'; // Default fallback role
};
