
/**
 * Export all role-related functionality
 */

// Export values (non-type exports)
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES } from './types';
// Export type separately using 'export type'
export type { UserRole } from './types';

// Export functions from guards
export { isUserRole, getAllowedPathsForRole, canAccessPath, hasRequiredRole, isAdminRole, isContentEditorRole, canAccessModule } from './guards';
export { determineUserRole } from './determination';
export * from './display';
export * from './permissions';
