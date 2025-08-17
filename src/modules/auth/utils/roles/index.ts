
/**
 * Unified exports for role-related functionality
 */

// Re-export types
export type { UserRole } from './types';

// Re-export constants
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES } from './types';

// Re-export functions
export { 
  isUserRole, 
  isValidRole,
  canAccessModule,
  canAccessPath,
  hasRequiredRole,
  isAdminRole,
  isContentEditorRole,
  getAllowedPathsForRole
} from './guards';

// Re-export determination functions
export { determineUserRole } from './determination';

// Re-export display functions
export { getRoleDisplayName, roleNames, roleDescriptions } from './display';

// Re-export permissions functions
export { getRolePermissions, getAllowedModulesForRole, getAccessibleModules } from './permissions';

// Re-export legacy compatibility functions
export { normalizeRole, isLegacyRole, getRoleDisplayName as getLegacyRoleDisplayName } from '../../normalizeRole';
