
/**
 * Role display and localization utilities
 */
import { UserRole } from './types';

/**
 * Get a display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'anonymous': 'Gjest',
    'user': 'Bruker',
    'company': 'Bedrift',
    'admin': 'Administrator',
    'master_admin': 'Master Administrator'
  };
  
  return displayNames[role] || role;
}
