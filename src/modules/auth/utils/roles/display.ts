
/**
 * Functions for displaying and formatting user roles
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

/**
 * Get CSS classes for role badges
 */
export function getRoleBadgeClass(role: UserRole): string {
  const badgeClasses: Record<UserRole, string> = {
    'anonymous': 'bg-gray-200 text-gray-800',
    'user': 'bg-blue-100 text-blue-800',
    'company': 'bg-green-100 text-green-800',
    'admin': 'bg-purple-100 text-purple-800',
    'master_admin': 'bg-red-100 text-red-800'
  };
  
  return badgeClasses[role] || 'bg-gray-100 text-gray-800';
}
