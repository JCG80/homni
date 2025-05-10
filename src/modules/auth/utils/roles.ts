
export type UserRole = 'guest' | 'member' | 'company' | 'admin' | 'master_admin' | 'provider' | 'editor';

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
 * Determine user role based on metadata or default to member
 */
export function determineUserRole(metadata: Record<string, any> | null): UserRole {
  if (!metadata || !metadata.role) {
    return 'member';
  }

  const role = metadata.role as string;
  
  // Validate if the role is a valid UserRole
  if (isUserRole(role)) {
    return role;
  }
  
  return 'member'; // Default fallback role
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
  if (!role) return [];
  
  // Master admin can access everything
  if (role === 'master_admin') return Object.keys(moduleAccessMap);
  
  // Find all modules this role can access
  return Object.entries(moduleAccessMap)
    .filter(([_, allowedRoles]) => allowedRoles.includes(role))
    .map(([moduleName, _]) => moduleName);
}
