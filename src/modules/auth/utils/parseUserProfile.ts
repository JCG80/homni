
import { Profile } from '../types/types';
import { isUserRole } from './roles/guards';

/**
 * Parse user profile data from the database into a structured Profile object
 * This ensures consistent handling of profile data throughout the application
 */
export const parseUserProfile = (profileData: any): Profile | null => {
  if (!profileData) return null;

  console.log('[parseUserProfile] Raw profile data:', profileData);

  // Extract role - prefer direct 'role' column (newly added), fallback to metadata.role
  let role = profileData.role;
  if (!role && profileData.metadata && typeof profileData.metadata === 'object') {
    role = profileData.metadata.role;
  }

  // Handle legacy 'user' role mapping
  if (role === 'user') {
    console.log('[parseUserProfile] Converting legacy "user" role to "member"');
    role = 'member';
  }

  // Validate role
  if (!isUserRole(role)) {
    console.warn(`[parseUserProfile] Invalid role '${role}' found, defaulting to 'member'`);
    role = 'member';
  }

  // Extract company_id - prefer direct column (newly added), fallback to metadata
  const companyId = profileData.company_id || 
    (profileData.metadata && typeof profileData.metadata === 'object' ? 
      profileData.metadata.company_id : undefined);

  const parsed = {
    id: profileData.id,
    full_name: profileData.full_name,
    role: role,
    company_id: companyId,
    created_at: profileData.created_at,
    metadata: profileData.metadata || {},
    email: profileData.email,
    phone: profileData.phone,
    updated_at: profileData.updated_at
  };

  console.log('[parseUserProfile] Parsed profile:', parsed);
  return parsed;
};
