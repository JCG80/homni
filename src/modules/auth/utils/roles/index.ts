
/**
 * Export all role-related functionality
 */

// Export specific items from each file to avoid duplicate exports
export { isUserRole, canAccessModule, hasRequiredRole, isAdminRole, isContentEditorRole } from './guards';
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES, UserRole } from './types';
export { determineUserRole } from './determination';
export * from './display';
export * from './permissions';
