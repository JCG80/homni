/**
 * Canonical role normalization for Homni project
 * Maps legacy roles to canonical values with fallback to 'guest'
 */
import { logger } from '@/utils/logger';

export type UserRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

/**
 * All roles in the system - CANONICAL SOURCE OF TRUTH
 */
export const ALL_ROLES: UserRole[] = [
  'guest',
  'user', 
  'company',
  'content_editor',
  'admin',
  'master_admin'
];

/**
 * Public-facing roles
 */
export const PUBLIC_ROLES: UserRole[] = [
  'guest'
];

/**
 * Roles that require authentication
 */
export const AUTHENTICATED_ROLES: UserRole[] = [
  'user',
  'company',
  'content_editor',
  'admin',
  'master_admin'
];

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isUserRole(role: any): role is UserRole {
  return ALL_ROLES.includes(role as UserRole);
}

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  // Legacy mappings
  'anonymous': 'guest',
  'anon': 'guest',
  'member': 'user',
  'regular': 'user',
  'basic': 'user',
  'customer': 'user',
  
  // Company mapping
  'business': 'company',
  'provider': 'company',
  'vendor': 'company',
  'buyer': 'company',
  
  // Content editor mapping
  'editor': 'content_editor',
  'moderator': 'content_editor',
  'content_admin': 'content_editor',
  
  // Admin mapping - admin stays admin
  'admin': 'admin',
  
  // Master admin mapping
  'super_admin': 'master_admin',
  'root': 'master_admin',
  'system_admin': 'master_admin',
  
  // Idempotent mappings (canonical roles map to themselves)
  'guest': 'guest',
  'user': 'user',
  'company': 'company',
  'content_editor': 'content_editor',
  'master_admin': 'master_admin'
};

/**
 * Normalizes any role string to canonical UserRole
 * @param role - Raw role string from various sources
 * @returns Canonical UserRole with fallback to 'guest'
 */
export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role || typeof role !== 'string') {
    return 'guest';
  }
  
  const cleanRole = role.toLowerCase().trim();
  
  // Check if already canonical
  if (isCanonicalRole(cleanRole)) {
    return cleanRole as UserRole;
  }
  
  // Map legacy role
  const normalized = LEGACY_ROLE_MAP[cleanRole];
  if (normalized) {
    return normalized;
  }
  
  // Fallback to guest for unknown roles
  logger.warn('Unknown role normalized to guest', { role, normalized: 'guest' });
  return 'guest';
}

/**
 * Checks if a role is already canonical (no mapping needed)
 */
function isCanonicalRole(role: string): boolean {
  return ALL_ROLES.includes(role as UserRole);
}

/**
 * Checks if a role is a legacy role that needs mapping
 */
export function isLegacyRole(role: string | null | undefined): boolean {
  if (!role || typeof role !== 'string') {
    return false;
  }
  
  const cleanRole = role.toLowerCase().trim();
  return cleanRole in LEGACY_ROLE_MAP && !isCanonicalRole(cleanRole);
}

/**
 * Gets display name for UI presentation
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'guest': 'Guest',
    'user': 'User',
    'company': 'Company',
    'content_editor': 'Content Editor',
    'admin': 'Administrator',
    'master_admin': 'Master Administrator'
  };
  
  return displayNames[role] || 'Guest';
}

/**
 * Gets role hierarchy level for permissions (higher = more access)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    'guest': 0,
    'user': 1,
    'company': 2,
    'content_editor': 3,
    'admin': 4,
    'master_admin': 5
  };
  
  return levels[role] || 0;
}

/**
 * Checks if user has at least the specified role level
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}