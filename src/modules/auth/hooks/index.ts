/**
 * SINGLE SOURCE OF TRUTH: Auth module exports
 * All auth-related imports should come from this file
 */

// Core hooks - MAIN EXPORTS
export { useAuth, AuthProvider } from '../context';
export { useAuthSession } from './useAuthSession';
export { useAuthState } from './useAuthState';
export { useAuthDerivedState } from './useAuthDerivedState';

// Role management hooks
export { useRoleCheck, useRoleNavigation, useRoleProtection } from './roles';

// Specialized hooks
export { useAuthStatus } from './useAuthStatus';
export { useAuthRetry } from './useAuthRetry';
export { useProfileManager } from './useProfileManager';
