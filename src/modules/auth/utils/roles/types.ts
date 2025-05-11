
/**
 * Core role type definitions
 */

/**
 * All possible user roles in the system
 */
export type UserRole = 'anonymous' | 'user' | 'company' | 'admin' | 'master_admin';

/**
 * Constants defining role categories
 */
export const ALL_ROLES: UserRole[] = [
  'user',
  'company',
  'admin',
  'master_admin'
];

export const PUBLIC_ROLES: UserRole[] = ['anonymous'];

export const AUTHENTICATED_ROLES: UserRole[] = [
  'user',
  'company',
  'admin',
  'master_admin'
];
