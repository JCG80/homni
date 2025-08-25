/**
 * Canonical route mapping for roles - single source of truth for navigation
 * Part of the Ultimate Master 2.0 QuickLogin solution
 */
import type { UserRole } from '@/types/auth';

/**
 * Get the default route for a given user role
 * @param role - User role (canonical)
 * @returns Route path for the role
 */
export function routeForRole(role: UserRole): string {
  switch (role) {
    case 'master_admin':
      return '/dashboard/admin';
    case 'admin':
      return '/dashboard/admin';
    case 'content_editor':
      return '/dashboard/content-editor';
    case 'company':
      return '/dashboard/company';
    case 'user':
      return '/dashboard';
    case 'guest':
    default:
      return '/';
  }
}