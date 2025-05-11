
/**
 * Core role type definitions
 */

/**
 * All possible user roles in the system
 */
export type UserRole = 'anonymous' | 'user' | 'member' | 'company' | 'business' | 'admin' | 'master_admin' | 'provider' | 'content_editor';

/**
 * Constants defining role categories
 */
export const ALL_ROLES: UserRole[] = [
  'user',
  'member',
  'company', 
  'business',
  'admin',
  'master_admin',
  'provider',
  'content_editor'
];

export const PUBLIC_ROLES: UserRole[] = ['anonymous'];

export const AUTHENTICATED_ROLES: UserRole[] = [
  'user',
  'member',
  'company',
  'business',
  'admin',
  'master_admin',
  'provider',
  'content_editor'
];

/**
 * Type for account types in the system (matching database)
 */
export type AccountType = 'member' | 'company' | 'admin' | 'master_admin' | 'provider';

/**
 * Interface for users with role information
 */
export interface RoleUser {
  id: string;
  email?: string;
  account_type: AccountType;
  internal_admin: boolean;
  module_access: string[];
}
