/**
 * Role constants and types for the Homni application
 * Single source of truth for role definitions
 */

// AppRole type matching the database enum
export type AppRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

// Role levels for permission hierarchy
export const ROLE_LEVELS: Record<AppRole, number> = {
  guest: 0,
  user: 20,
  company: 40,
  content_editor: 60,
  admin: 80,
  master_admin: 100,
} as const;

// Minimum levels for admin access
export const ADMIN_MIN_LEVEL = 80;
export const MASTER_MIN_LEVEL = 100;

// All available roles
export const ALL_ROLES: AppRole[] = [
  'guest',
  'user', 
  'company',
  'content_editor',
  'admin',
  'master_admin'
] as const;

// Role display names (Norwegian)
export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  guest: 'Gjest',
  user: 'Bruker',
  company: 'Bedrift',
  content_editor: 'Innholdsredaktør',
  admin: 'Administrator',
  master_admin: 'Hovedadministrator',
} as const;

// Role descriptions (Norwegian)
export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  guest: 'Ikke innlogget bruker med begrenset tilgang',
  user: 'Registrert bruker med grunnleggende tilgang',
  company: 'Bedriftsbruker med tilgang til bedriftsverktøy',
  content_editor: 'Innholdsredaktør med tilgang til å redigere innhold',
  admin: 'Administrator med utvidet tilgang til systemfunksjoner',
  master_admin: 'Hovedadministrator med full tilgang til alle funksjoner',
} as const;

/**
 * Type guard to check if a string is a valid AppRole
 */
export function isAppRole(role: any): role is AppRole {
  return ALL_ROLES.includes(role as AppRole);
}

/**
 * Get role level number for a given role
 */
export function getRoleLevel(role: AppRole): number {
  return ROLE_LEVELS[role];
}

/**
 * Check if a role has at least the required level
 */
export function hasMinimumRoleLevel(userRole: AppRole, requiredRole: AppRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}