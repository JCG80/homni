
/**
 * User role definition
 */

// Import from our unified types
import type { UserRole } from '../../types/unified-types';

// All possible roles in the system
export type { UserRole };

// All roles (used for validation)
export const ALL_ROLES: UserRole[] = [
  'guest',
  'user',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];

// Public-facing roles
export const PUBLIC_ROLES: UserRole[] = [
  'guest'
];

// Roles that require authentication
export const AUTHENTICATED_ROLES: UserRole[] = [
  'user',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];

// Type guard to check if a string is a valid UserRole
export function isUserRole(role: any): role is UserRole {
  return ALL_ROLES.includes(role as UserRole);
}
