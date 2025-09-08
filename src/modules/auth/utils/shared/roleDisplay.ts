/**
 * Shared role display constants for consistent UI
 * SINGLE SOURCE OF TRUTH for role icons and labels
 */
import { UserRole } from '../../normalizeRole';
import { User, Building2, Edit3, Shield, Crown } from 'lucide-react';

export const roleIcons = {
  guest: User,
  user: User,
  company: Building2,
  content_editor: Edit3,
  admin: Shield,
  master_admin: Crown,
} as const;

export const roleLabels = {
  guest: 'Gjest',
  user: 'Bruker',
  company: 'Bedrift',
  content_editor: 'Innholdsredaktør',
  admin: 'Administrator',
  master_admin: 'Master Admin',
} as const;

/**
 * Get icon component for a role
 */
export function getRoleIcon(role: UserRole) {
  return roleIcons[role];
}

/**
 * Get Norwegian label for a role
 */
export function getRoleLabel(role: UserRole) {
  return roleLabels[role];
}