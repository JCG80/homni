/**
 * Canonical route mapping for roles - single source of truth for navigation
 * Part of the Ultimate Master 2.0 QuickLogin solution
 * PHASE 1B: Enhanced with module-aware routing
 */
import type { UserRole } from '@/modules/auth/normalizeRole';

/**
 * Get the default route for a given user role
 * @param role - User role (canonical)
 * @returns Route path for the role
 */
export function routeForRole(role: UserRole): string {
  switch (role) {
    case 'master_admin':
      return '/dashboard/master-admin';
    case 'admin':
      return '/dashboard/admin';
    case 'content_editor':
      return '/dashboard/content-editor';
    case 'company':
      return '/dashboard/company';
    case 'user':
      return '/dashboard/user';
    case 'guest':
    default:
      return '/';
  }
}

/**
 * Get module-aware dashboard route based on user's enabled modules
 * Falls back to basic role route if modules are not available
 * @param role - User role
 * @param enabledModules - Array of enabled module IDs for the user
 * @returns Best dashboard route for the user
 */
export function getModuleAwareDashboardRoute(role: UserRole, enabledModules: string[] = []): string {
  // If no modules enabled, use basic role route
  if (enabledModules.length === 0) {
    return routeForRole(role);
  }
  
  // Role-specific module-aware routing
  switch (role) {
    case 'master_admin':
      if (enabledModules.includes('system_management')) {
        return '/dashboard/master-admin/system';
      }
      if (enabledModules.includes('analytics')) {
        return '/dashboard/master-admin/analytics';
      }
      return '/dashboard/master-admin';
      
    case 'admin':
      if (enabledModules.includes('analytics') && enabledModules.includes('lead_management')) {
        return '/dashboard/admin/analytics';
      }
      if (enabledModules.includes('user_management')) {
        return '/dashboard/admin/users';
      }
      return '/dashboard/admin';
      
    case 'company':
      if (enabledModules.includes('lead_management')) {
        return '/dashboard/company/leads';
      }
      if (enabledModules.includes('lead_marketplace')) {
        return '/dashboard/company/marketplace';
      }
      return '/dashboard/company';
      
    case 'content_editor':
      if (enabledModules.includes('content_management')) {
        return '/dashboard/content';
      }
      return '/dashboard/content-editor';
      
    case 'user':
      if (enabledModules.includes('property_management')) {
        return '/dashboard/user/properties';
      }
      return '/dashboard/user';
      
    case 'guest':
    default:
      return '/';
  }
}