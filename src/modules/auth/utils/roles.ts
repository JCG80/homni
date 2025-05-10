
export type UserRole = 'anonymous' | 'user' | 'company' | 'admin' | 'master-admin' | 'provider' | 'editor';

/**
 * Get all modules a specific role has access to
 */
export function getAllowedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'anonymous':
      return ['home', 'leads/submit', 'info'];
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
