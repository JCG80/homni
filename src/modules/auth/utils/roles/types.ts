
/**
 * Core role type definitions
 */

/**
 * All possible user roles in the system
 */
export type UserRole = 'guest' | 'member' | 'company' | 'admin' | 'master_admin' | 'provider' | 'editor';

/**
 * Constants defining role categories
 */
export const ALL_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'provider', 
  'editor'
];

export const PUBLIC_ROLES: UserRole[] = ['guest'];

export const AUTHENTICATED_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'provider',
  'editor'
];
