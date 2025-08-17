/**
 * Canonical role normalization for Homni project
 * Maps legacy roles to canonical values with fallback to 'guest'
 */

export type UserRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  // Anonymous/Guest mapping
  'anonymous': 'guest',
  'anon': 'guest',
  
  // User mapping  
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
  'system_admin': 'master_admin'
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
  console.warn(`Unknown role '${role}' normalized to 'guest'`);
  return 'guest';
}

/**
 * Checks if a role is already canonical (no mapping needed)
 */
function isCanonicalRole(role: string): boolean {
  const canonicalRoles: UserRole[] = ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'];
  return canonicalRoles.includes(role as UserRole);
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