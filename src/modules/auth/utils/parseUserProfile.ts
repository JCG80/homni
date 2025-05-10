
import { Profile, UserRole } from '../types/types';

/**
 * Parse and validate raw user profile data into a properly typed Profile object
 * Ensures type safety and consistent data structure
 */
export function parseUserProfile(item: any): Profile {
  // Validate role is a valid UserRole
  let role: UserRole = 'user'; // Default role
  if (item.role && ['user', 'company', 'admin', 'master-admin', 'provider'].includes(item.role)) {
    role = item.role as UserRole;
  }
  
  return {
    id: item.id || '',
    full_name: item.full_name || '',
    role: role,
    company_id: item.company_id || undefined,
    created_at: item.created_at || new Date().toISOString(),
  };
}
