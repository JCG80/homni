
import { Profile, UserRole } from '../types/types';
import { isUserRole } from './roles';

/**
 * Parse and validate raw user profile data into a properly typed Profile object
 * Ensures type safety and consistent data structure
 */
export function parseUserProfile(item: any): Profile {
  // Validate role is a valid UserRole using type guard
  let role: UserRole = 'member'; // Default role
  if (item.role && isUserRole(item.role)) {
    role = item.role as UserRole;
  }
  
  // Extract company_id from metadata if it exists
  const companyId = item.company_id || 
    (item.metadata && typeof item.metadata === 'object' ? 
      item.metadata.company_id : undefined);
  
  return {
    id: item.id || '',
    full_name: item.full_name || '',
    role: role,
    company_id: companyId,
    created_at: item.created_at || new Date().toISOString(),
    metadata: item.metadata || {},
    email: item.email,
    phone: item.phone,
    updated_at: item.updated_at,
  };
}
