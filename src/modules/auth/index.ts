
/**
 * Central export file for the auth module.
 * This file exports all publicly accessible functions, components, hooks, and types.
 */

// Export components
export { Authenticated } from './components/Authenticated';
export { ProtectedRoute } from './components/ProtectedRoute';
export { AuthProvider } from './hooks/useAuth';

// Export hooks
export { useAuth } from './hooks/useAuth';
export { useRoleGuard } from './hooks/useRoleGuard';
export { useRoleHelpers } from './hooks/useRoleHelpers';
export { useRoleRedirect } from './hooks/useRoleRedirect';

// Export utilities
export { 
  canAccessModule,
  hasRequiredRole,
  isAdminRole,
  isUserRole,
  isContentEditorRole
} from './utils/roles';

// Export types
export type { UserRole } from './utils/roles/types';
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES } from './utils/roles/types';

// Re-export for backward compatibility
export * from './utils/roles';
