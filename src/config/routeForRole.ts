/**
 * Canonical route mapping for roles - single source of truth for navigation
 * Part of the Ultimate Master 2.0 QuickLogin solution
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