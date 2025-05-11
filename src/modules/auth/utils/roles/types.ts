
/**
 * User role definition
 */

// All possible roles in the system
export type UserRole = 
  | 'anonymous'     // Not logged in
  | 'member'        // Member user
  | 'company'       // Company user
  | 'admin'         // Admin user
  | 'master_admin'  // Master admin
  | 'content_editor'; // Content editor

// All roles (used for validation)
export const ALL_ROLES: UserRole[] = [
  'anonymous',
  'member',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];

// Public-facing roles
export const PUBLIC_ROLES: UserRole[] = [
  'anonymous'
];

// Roles that require authentication
export const AUTHENTICATED_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];
