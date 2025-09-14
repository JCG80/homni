
/**
 * SINGLE SOURCE OF TRUTH: Role system exports
 * Enhanced with new database-driven role management
 */

// Re-export types
export type { UserRole } from './types';

// Re-export constants
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES } from './types';

// Re-export enhanced functions (includes new async database functions)
export { 
  isUserRole, 
  isValidRole,
  canAccessModule,
  canAccessPath,
  hasRequiredRole,
  isAdminRole,
  isContentEditorRole,
  getAllowedPathsForRole,
  // New enhanced async functions
  hasRole,
  hasRoleLevel, 
  isAdminAsync,
  isMasterAdminAsync
} from './guards';

// Re-export determination functions
export { determineUserRole } from './determination';

// Re-export display functions
export { getRoleDisplayName, roleNames, roleDescriptions } from './display';

// Re-export permissions functions
export { getRolePermissions, getAllowedModulesForRole, getAccessibleModules } from './permissions';

// Re-export legacy compatibility functions
export { normalizeRole, isLegacyRole, getRoleDisplayName as getLegacyRoleDisplayName } from '../../normalizeRole';

// Re-export new role management service
export { RoleManagementService } from '@/services/roleManagementService';
