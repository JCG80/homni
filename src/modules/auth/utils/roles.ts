
export type UserRole = 'anonymous' | 'user' | 'company' | 'admin' | 'master-admin' | 'provider' | 'editor';

export const ALL_ROLES: UserRole[] = [
  'user',
  'company',
  'admin',
  'master-admin',
  'provider', 
  'editor'
];

export const PUBLIC_ROLES: UserRole[] = ['anonymous'];

export const AUTHENTICATED_ROLES: UserRole[] = [
  'user',
  'company',
  'admin',
  'master-admin',
  'provider',
  'editor'
];

/**
 * Get all modules a specific role has access to
 */
export function getAllowedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'anonymous':
      return ['home', 'leads/submit', 'info', 'login', 'register'];
    case 'user':
      return ['dashboard', 'leads'];
    case 'company':
      return ['dashboard', 'leads', 'settings', 'reports'];
    case 'admin':
      return ['admin', 'leads', 'companies', 'reports', 'content'];
    case 'editor':
      return ['content', 'dashboard'];
    case 'master-admin':
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
    'anonymous': 'Gjest',
    'user': 'Bruker',
    'company': 'Bedrift',
    'admin': 'Administrator',
    'master-admin': 'Master Administrator',
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
  return ['admin', 'master-admin'].includes(role);
}

/**
 * Determine if a role has content editor privileges
 */
export function isContentEditorRole(role: UserRole | null): boolean {
  if (!role) return false;
  return ['admin', 'master-admin', 'editor'].includes(role);
}

/**
 * Determine user role based on metadata or default to basic user
 */
export function determineUserRole(metadata: Record<string, any> | null): UserRole {
  if (!metadata || !metadata.role) {
    return 'user';
  }

  const role = metadata.role as string;
  
  // Validate if the role is a valid UserRole
  if (ALL_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  return 'user'; // Default fallback role
}

/**
 * Get all modules that can be accessed by a specific role using a module access map
 */
export function getAccessibleModules(
  role: UserRole | null,
  moduleAccessMap: Record<string, UserRole[]> = {
    'leads': ['user', 'company', 'admin', 'master-admin'],
    'admin': ['admin', 'master-admin'],
    'company': ['company', 'admin', 'master-admin'],
    'geo': ['user', 'company', 'admin', 'master-admin', 'provider'],
    'content': ['admin', 'master-admin', 'editor'],
    'settings': ['admin', 'master-admin']
  }
): string[] {
  if (!role) return [];
  
  // Master admin can access everything
  if (role === 'master-admin') return Object.keys(moduleAccessMap);
  
  // Find all modules this role can access
  return Object.entries(moduleAccessMap)
    .filter(([_, allowedRoles]) => allowedRoles.includes(role))
    .map(([moduleName, _]) => moduleName);
}
