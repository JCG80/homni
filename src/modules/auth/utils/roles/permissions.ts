
/**
 * Role-based access control and module permissions
 */
import { UserRole } from './types';

/**
 * Get all modules a specific role has access to
 */
export function getAllowedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'guest':
      return ['home', 'leads/submit', 'info', 'login', 'register'];
    case 'user':
      return ['dashboard', 'leads', 'leads/my', 'profile', 'properties', 'maintenance', 'my-account'];
    case 'company':
      return ['dashboard', 'leads', 'company', 'company/profile', 'settings', 'reports'];
    case 'admin':
      return ['admin', 'leads', 'companies', 'reports', 'content'];
    case 'master_admin':
      return ['*']; // access to all modules
    case 'content_editor':
      return ['dashboard', 'content', 'profile'];
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
    'content': ['content_editor', 'admin', 'master_admin'],
    'settings': ['company', 'admin', 'master_admin']
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

/**
 * Get permissions for a specific role
 * @param role The user role
 * @returns An object containing the permissions for the role
 */
export function getRolePermissions(role: UserRole | null): Record<string, boolean> {
  if (!role) return { canView: false, canEdit: false, canDelete: false, canCreate: false };
  
  // Base permissions
  const permissions: Record<string, boolean> = {
    canView: true,
    canEdit: false,
    canDelete: false,
    canCreate: false,
  };
  
  // Add role-specific permissions
  switch (role) {
    case 'admin':
    case 'master_admin':
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canCreate = true;
      break;
    case 'content_editor':
      permissions.canEdit = true;
      permissions.canCreate = true;
      break;
    case 'company':
      permissions.canEdit = true; // Companies can edit their own profiles
      permissions.canCreate = true; // Companies can create leads
      break;
    case 'user':
      permissions.canCreate = true; // Users can create leads
      break;
    default:
      // Anonymous users only have view permissions
      break;
  }
  
  return permissions;
}
