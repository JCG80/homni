
import { Profile } from '../types/types';
import { isUserRole } from './roles/guards';

/**
 * Parse user profile data from the database into a structured Profile object
 * This ensures consistent handling of profile data throughout the application
 */
export const parseUserProfile = (profileData: any): Profile | null => {
  if (!profileData) return null;

  // Log the raw profile data for debugging
  console.log("Parsing profile data:", profileData);

  // Extract role from metadata if present
  let role = profileData.role;
  
  // If role not directly on profile, try to get it from metadata
  if (!role && profileData.metadata) {
    // Handle both string and object metadata
    if (typeof profileData.metadata === 'string') {
      try {
        const parsedMetadata = JSON.parse(profileData.metadata);
        role = parsedMetadata.role;
      } catch (e) {
        console.warn("Failed to parse metadata string:", e);
      }
    } else if (typeof profileData.metadata === 'object') {
      role = profileData.metadata.role;
    }
  }
  
  // Extract company_id from metadata if present
  const companyId = profileData.company_id || 
    (profileData.metadata && typeof profileData.metadata === 'object' ? 
      profileData.metadata.company_id : undefined);
  
  // Validate that role is a valid UserRole
  if (role === 'user') {
    console.warn(`Deprecated role 'user' found in profile ${profileData.id}, changing to 'member'`);
    role = 'member';
  } else if (role === 'business' || role === 'provider') {
    console.warn(`Deprecated role '${role}' found in profile ${profileData.id}, changing to 'company'`);
    role = 'company';
  } else if (!isUserRole(role)) {
    console.warn(`Invalid role '${role}' found in profile ${profileData.id}, defaulting to 'member'`);
    role = 'member';
  }
  
  console.log(`Profile ${profileData.id} parsed with role: ${role}`);
  
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
