
/**
 * Role-based access control and module permissions
 */
import { UserRole } from './types';

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
    case 'master_admin':
      return ['*']; // access to all modules
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
 * Get all modules that can be accessed by a specific role using a module access map
 */
export function getAccessibleModules(
  role: UserRole | null,
  moduleAccessMap: Record<string, UserRole[]> = {
    'leads': ['user', 'company', 'admin', 'master_admin'],
    'admin': ['admin', 'master_admin'],
    'company': ['company', 'admin', 'master_admin'],
    'geo': ['user', 'company', 'admin', 'master_admin'],
    'content': ['admin', 'master_admin'],
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
