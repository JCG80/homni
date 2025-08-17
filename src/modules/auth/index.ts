
// Re-export the components
export * from './components/AuthWrapper';
export * from './components/Authenticated';
export * from './components/LoginForm';
export * from './components/ProtectedRoute';
export * from './components/QuickLogin';

// Re-export the types
export * from './types/types';

// Re-export the hooks
export * from './hooks/useAuth';

// Re-export the utility functions
export { isUserRole, canAccessPath, canAccessModule } from './utils/roles/guards';
export { getRoleDisplayName } from './utils/roles/display';
export { getRolePermissions } from './utils/roles/permissions';
export { normalizeRole, isLegacyRole } from './normalizeRole';
