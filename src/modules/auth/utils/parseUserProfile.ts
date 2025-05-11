
import { Profile } from '../types/types';
import { UserRole } from './roles';
import { isUserRole } from './roles';

/**
 * Parse user profile data from database into typed Profile object
 * Ensures all required fields are present and properly typed
 */
export const parseUserProfile = (data: any): Profile | null => {
  if (!data || !data.id) return null;
  
  // Extract role from metadata or use default role
  let role: UserRole = 'member'; // Default role
  
  if (data.role && isUserRole(data.role)) {
    role = data.role as UserRole;
  } else if (data.metadata && typeof data.metadata === 'object') {
    // Try to get role from metadata if it exists
    if (data.metadata.role && isUserRole(data.metadata.role)) {
      role = data.metadata.role as UserRole;
    }
  }

  return {
    id: data.id,
    full_name: data.full_name || '',
    role,
    company_id: data.company_id || undefined,
    created_at: data.created_at,
    metadata: data.metadata || {},
    email: data.email || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
    region: data.region || undefined,
    profile_picture_url: data.profile_picture_url || undefined,
    preferences: data.preferences || {},
    updated_at: data.updated_at || undefined
  };
};
