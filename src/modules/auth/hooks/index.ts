/**
 * SINGLE SOURCE OF TRUTH: Auth module exports
 * All auth-related imports should come from this file
 */

// Core hooks - MAIN EXPORTS
export { useAuth, AuthProvider } from './useAuth';
export { useAuthSession } from './useAuthSession';
export { useAuthContext } from './useAuthContext';
export { useAuthState } from './useAuthState';
export { useAuthDerivedState } from './useAuthDerivedState';

// Role management hooks
export { useRoleCheck, useRoleNavigation, useRoleProtection } from './roles';

// Specialized hooks
export { useAuthStatus } from './useAuthStatus';
export { useAuthRetry } from './useAuthRetry';
export { useProfileManager } from './useProfileManager';

// Legacy hooks (deprecated but exported for backward compatibility)
export { useRoleHelpers } from './useRoleHelpers';
export { useRoleGuard } from './useRoleGuard';
export { useRoleRedirect } from './useRoleRedirect';
