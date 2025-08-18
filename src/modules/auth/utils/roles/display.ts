
/**
 * Map of user roles to human-readable names
 * Used for displaying role names in the UI
 */
import { UserRole } from './types';

export const roleNames: Partial<Record<UserRole, string>> = {
  anonymous: 'Anonym',
  user: 'Bruker',
  company: 'Bedrift',
  admin: 'Administrator',
  master_admin: 'Hovedadministrator',
  content_editor: 'Innholdsredaktør'
};

/**
 * Map of user roles to descriptions
 * Used for displaying role descriptions in the UI
 */
export const roleDescriptions: Partial<Record<UserRole, string>> = {
  anonymous: 'Ikke innlogget bruker med begrenset tilgang.',
  user: 'Medlemsbruker med utvidet tilgang.',
  company: 'Bedriftsbruker med tilgang til bedriftsverktøy.',
  admin: 'Administrator med tilgang til administrasjonsverktøy.',
  master_admin: 'Hovedadministrator med full tilgang til alle funksjoner.',
  content_editor: 'Innholdsredaktør med tilgang til å redigere innhold.'
};

/**
 * Get a human-readable display name for a user role
 * @param role The user role
 * @returns The display name or the role itself if no mapping exists
 */
export function getRoleDisplayName(role: UserRole | null): string {
  if (!role) return 'Unknown';
  return roleNames[role] || role;
}
