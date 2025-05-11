
import { UserRole } from './types';

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
