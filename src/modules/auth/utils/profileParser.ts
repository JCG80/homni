
import { Profile } from '../types/types';
import { isUserRole } from '../utils/roles';

/**
 * Parse raw profile data from database into typed Profile object
 */
export const parseProfileData = (profileData: any): Profile | null => {
  if (!profileData) return null;

  // Extract company_id from metadata if present
  const companyId = profileData.company_id || 
    (profileData.metadata && typeof profileData.metadata === 'object' ? 
      profileData.metadata.company_id : undefined);
  
  // Validate that role is a valid UserRole
  let role = profileData.role;
  if (!isUserRole(role)) {
    console.warn(`Invalid role '${role}' found in profile, defaulting to 'member'`);
    role = 'member';
  }
  
  return {
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
};
