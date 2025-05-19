
/**
 * Export all auth hooks
 */
export { useAuth } from './useAuth';
export { useRoleCheck, useRoleNavigation, useRoleProtection } from './roles';
export { AuthProvider } from './useAuth';

// Legacy hooks (deprecated but exported for backward compatibility)
export { useRoleHelpers } from './useRoleHelpers';
export { useRoleGuard } from './useRoleGuard';
export { useRoleRedirect } from './useRoleRedirect';

// Other hooks
export { useAuthContext } from './useAuthContext';
export { useAuthState } from './useAuthState';
