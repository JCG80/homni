
/**
 * Role display and localization utilities
 */
import { UserRole } from './types';

/**
 * Get a display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'guest': 'Gjest',
    'member': 'Bruker',
    'company': 'Bedrift',
    'admin': 'Administrator',
    'master_admin': 'Master Administrator',
    'provider': 'Tjenesteleverandør',
    'editor': 'Redaktør'
  };
  
  return displayNames[role] || role;
}
