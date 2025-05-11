
/**
 * Role guards for access control
 */
import { UserRole, ALL_ROLES } from './types';

/**
 * Map of allowed paths for each role
 * This is used to restrict access to certain pages based on user role
 * Each role inherits the paths from the roles below it
 */
const rolePaths: Partial<Record<UserRole, string[]>> = {
  anonymous: [
    '/',
    '/login',
    '/register',
    '/reset-password',
    '/unauthorized',
    '/about',
    '/contact',
    '/power-comparison',
    '/insurance-comparison',
    '/insurance-companies',
    '/insurance-company/*',
    '/lead-capture'
  ],
  user: [
    '/dashboard',
    '/my-account',
    '/profile',
    '/properties',
    '/property/*',
    '/leads',
  ],
  member: [
    '/member-dashboard',
    '/member-leads',
  ],
  company: [
    '/company-dashboard',
    '/company-leads',
    '/company-profile',
    '/company-settings',
  ],
  business: [
    '/business-dashboard',
  ],
  provider: [
    '/provider-dashboard',
  ],
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/companies',
    '/admin/leads',
    '/admin/system',
    '/admin/content',
  ],
  master_admin: [
    '/admin/roles',
    '/admin/modules',
    '/admin/system/modules',
    '/admin/system/logs',
  ],
  content_editor: [
    '/admin/content',
    '/admin/content/*',
  ],
};

/**
 * Check if a string is a valid UserRole
 */
export const isUserRole = (role: string): role is UserRole => {
  return ALL_ROLES.includes(role as UserRole);
};

/**
 * Get all allowed paths for a given role
 * This includes paths from the role itself and all roles below it
 */
export function getAllowedPathsForRole(role?: UserRole): string[] {
  if (!role || role === 'anonymous') {
    return rolePaths.anonymous || [];
  }

  const roleHierarchy: UserRole[] = [];
  
  // Define role hierarchy
  switch (role) {
    case 'master_admin':
      roleHierarchy.push('master_admin', 'admin', 'company', 'user', 'anonymous');
      break;
    case 'admin':
      roleHierarchy.push('admin', 'company', 'user', 'anonymous');
      break;
    case 'content_editor':
      roleHierarchy.push('content_editor', 'user', 'anonymous');
      break;
    case 'company':
    case 'business':
    case 'provider':
      roleHierarchy.push(role, 'user', 'anonymous');
      break;
    case 'member':
      roleHierarchy.push('member', 'user', 'anonymous');
      break;
    case 'user':
      roleHierarchy.push('user', 'anonymous');
      break;
    default:
      roleHierarchy.push('anonymous');
  }

  // Collect paths from all relevant roles
  let paths: string[] = [];
  for (const r of roleHierarchy) {
    if (rolePaths[r]) {
      paths = [...paths, ...(rolePaths[r] || [])];
    }
  }

  return paths;
}

/**
 * Check if a user with given role can access a specific path
 */
export function canAccessPath(role: UserRole | undefined, path: string): boolean {
  const allowedPaths = getAllowedPathsForRole(role);
  
  // Direct match
  if (allowedPaths.includes(path)) return true;
  
  // Check for wildcard matches
  for (const allowedPath of allowedPaths) {
    if (allowedPath.endsWith('/*')) {
      const basePath = allowedPath.slice(0, -2);
      if (path.startsWith(basePath)) return true;
    }
  }
  
  return false;
}

/**
 * Check if a user has the required role or a higher role
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === requiredRole) return true;
  
  if (userRole === 'master_admin') return true;
  
  if (userRole === 'admin' && requiredRole !== 'master_admin') return true;
  
  return false;
}

/**
 * Check if a role is an admin role (admin or master_admin)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'master_admin';
}

/**
 * Check if a role is a content editor role
 */
export function isContentEditorRole(role: UserRole): boolean {
  return role === 'content_editor';
}

/**
 * Check if a user can access a specific module
 */
export function canAccessModule(role: UserRole, moduleId: string): boolean {
  // Admin and master_admin can access all modules
  if (role === 'admin' || role === 'master_admin') return true;
  
  // For other roles, specific module check would go here
  // This would typically check against a database of module permissions
  const standardModules = ['basic', 'reports', 'dashboard'];
  
  // Users can access standard modules
  if (role === 'user' && standardModules.includes(moduleId)) return true;
  
  // Companies can access company-specific modules
  if (role === 'company') {
    return [...standardModules, 'leads', 'company-profile'].includes(moduleId);
  }
  
  return false;
}
