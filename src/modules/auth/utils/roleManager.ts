
/**
 * Unified role management utilities for the auth module
 * Consolidates functionality from roles.ts and roleUtils.ts
 */

// Define UserRole type
export type UserRole = 'guest' | 'member' | 'company' | 'admin' | 'master_admin' | 'provider' | 'editor';

// Role constants
export const ALL_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'provider', 
  'editor'
];

export const PUBLIC_ROLES: UserRole[] = ['guest'];

export const AUTHENTICATED_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'provider',
  'editor'
];

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: any): value is UserRole {
  return ALL_ROLES.includes(value as UserRole) || value === 'guest';
}

/**
 * Get all modules a specific role has access to
 */
export function getAllowedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'guest':
      return ['home', 'leads/submit', 'info', 'login', 'register'];
    case 'member':
      return ['dashboard', 'leads'];
    case 'company':
      return ['dashboard', 'leads', 'settings', 'reports'];
    case 'admin':
      return ['admin', 'leads', 'companies', 'reports', 'content'];
    case 'editor':
      return ['content', 'dashboard'];
    case 'master_admin':
      return ['*']; // access to all modules
    case 'provider':
      return ['dashboard', 'leads', 'services'];
    default:
      return [];
  }
}

/**
 * Check if a role has access to a specific module
 */
export function canAccessModule(role: UserRole, module: string): boolean {
  const allowed = getAllowedModulesForRole(role);
  return allowed.includes('*') || allowed.includes(module);
}

/**
 * Get a display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'guest': 'Gjest',
    'member': 'Bruker',
    'company': 'Bedrift',
    'admin': 'Administrator',
    'master_admin': 'Master Administrator',
    'provider': 'Tjenesteleverandør',
    'editor': 'Redaktør'
  };
  
  return displayNames[role] || role;
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
  return ['admin', 'master_admin', 'editor'].includes(role);
}

/**
 * Determine user role based on metadata with fallback
 */
export function determineUserRole(userData: Record<string, any> | null): UserRole {
  try {
    // Primary implementation - from user data
    if (!userData) {
      return 'member';
    }

    // Extract role from user metadata
    const role = userData.role || 
      (userData.metadata && userData.metadata.role) || 
      (userData.user && userData.user.user_metadata && userData.user.user_metadata.role);
    
    // Check if we're in development mode and have special test emails
    if (import.meta.env.MODE === 'development' && userData.user?.email) {
      const email = userData.user.email.toLowerCase();
      
      // Map test emails to roles in development
      if (email === 'admin@test.local') return 'master_admin';
      if (email === 'company@test.local') return 'company';
      if (email === 'provider@test.local') return 'provider';
      if (email === 'editor@test.local') return 'editor';
    }
    
    // Validate if the role is a valid UserRole
    if (role && isUserRole(role)) {
      return role as UserRole;
    }
    
    return 'member'; // Default fallback role
  } catch (error) {
    console.error('Error determining user role:', error);
    return 'member'; // Fallback to default role on error
  }
}

/**
 * Get all modules that can be accessed by a specific role using a module access map
 */
export function getAccessibleModules(
  role: UserRole | null,
  moduleAccessMap: Record<string, UserRole[]> = {
    'leads': ['member', 'company', 'admin', 'master_admin'],
    'admin': ['admin', 'master_admin'],
    'company': ['company', 'admin', 'master_admin'],
    'geo': ['member', 'company', 'admin', 'master_admin', 'provider'],
    'content': ['admin', 'master_admin', 'editor'],
    'settings': ['admin', 'master_admin']
  }
): string[] {
  try {
    if (!role) return [];
    
    // Master admin can access everything
    if (role === 'master_admin') return Object.keys(moduleAccessMap);
    
    // Find all modules this role can access
    return Object.entries(moduleAccessMap)
      .filter(([_, allowedRoles]) => allowedRoles.includes(role))
      .map(([moduleName, _]) => moduleName);
  } catch (error) {
    console.error('Error getting accessible modules:', error);
    return []; // Return empty array as fallback
  }
}
