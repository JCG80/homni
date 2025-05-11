
import { UserRole } from './types';

/**
 * Map of user roles to human-readable names
 * Used for displaying role names in the UI
 */
export const roleNames: Partial<Record<UserRole, string>> = {
  anonymous: 'Anonym',
  member: 'Bruker',
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
  member: 'Medlemsbruker med utvidet tilgang.',
  company: 'Bedriftsbruker med tilgang til bedriftsverktøy.',
  admin: 'Administrator med tilgang til administrasjonsverktøy.',
  master_admin: 'Hovedadministrator med full tilgang til alle funksjoner.',
  content_editor: 'Innholdsredaktør med tilgang til å redigere innhold.'
};
