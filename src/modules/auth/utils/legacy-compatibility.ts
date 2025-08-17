/**
 * Legacy compatibility layer for role values
 * Handles migration from old role names to new standardized names
 */

import { UserRole } from '../types/unified-types';

/**
 * Map legacy role values to standardized role values
 */
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  // Legacy mappings
  'guest': 'anonymous',
  'user': 'member',
  'regular': 'member',
  'basic': 'member',
  'business': 'company',
  'provider': 'company',
  'editor': 'content_editor',
  'moderator': 'content_editor',
  'super_admin': 'master_admin',
  'root': 'master_admin',
  
  // Standard values (no mapping needed)
  'anonymous': 'anonymous',
  'member': 'member',
  'company': 'company',
  'content_editor': 'content_editor',
  'admin': 'admin',
  'master_admin': 'master_admin',
};

/**
 * Convert legacy role value to standardized role
 */
export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return 'anonymous';
  
  const normalizedRole = LEGACY_ROLE_MAP[role.toLowerCase()];
  if (normalizedRole) {
    return normalizedRole;
  }
  
  // If no mapping found, default to member for authenticated users
  console.warn(`Unknown role "${role}", defaulting to member`);
  return 'member';
}

/**
 * Check if a role value is a legacy role that needs mapping
 */
export function isLegacyRole(role: string): boolean {
  const legacyRoles = ['guest', 'user', 'regular', 'basic', 'business', 'provider', 'editor', 'moderator', 'super_admin', 'root'];
  return legacyRoles.includes(role.toLowerCase());
}

/**
 * Get display name for role (handles both legacy and new roles)
 */
export function getRoleDisplayName(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  
  const roleDisplayNames: Record<UserRole, string> = {
    'anonymous': 'Gjest',
    'member': 'Medlem',
    'company': 'Bedrift',
    'content_editor': 'Innholdsredaktør',
    'admin': 'Administrator',
    'master_admin': 'Hovedadministrator',
  };
  
  return roleDisplayNames[normalizedRole] || 'Ukjent';
}