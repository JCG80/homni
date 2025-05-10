
import { UserRole } from '../types/types';

/**
 * Determines the user's role based on metadata and email
 * Extracted and adapted from auth-api.ts for testability
 * 
 * @param authUser Auth user data containing metadata and email
 * @returns The determined UserRole
 */
export function determineUserRole(authUser: any): UserRole {
  let userRole: UserRole = 'user'; // Default role
  
  if (!authUser?.user) return userRole;
  
  const userMeta = authUser.user.user_metadata;
  const email = authUser.user.email;
  
  // Try to extract role from metadata
  if (userMeta) {
    if (typeof userMeta.role === 'string') {
      userRole = userMeta.role as UserRole;
    } else if (typeof userMeta['custom_claims'] === 'object' && userMeta['custom_claims']?.role) {
      userRole = userMeta['custom_claims'].role as UserRole;
    } else if (userMeta['role']) {
      userRole = userMeta['role'] as UserRole;
    } else if (typeof authUser.user.app_metadata?.role === 'string') {
      userRole = authUser.user.app_metadata.role as UserRole;
    }
  }
  
  // Special case for development test users based on email
  if (import.meta.env.MODE === 'development' && email) {
    if (email === 'admin@test.local') {
      userRole = 'master-admin';
      console.log('Development mode: Setting role for admin@test.local to master-admin');
    } else if (email === 'company@test.local') {
      userRole = 'company';
      console.log('Development mode: Setting role for company@test.local to company');
    } else if (email === 'provider@test.local') {
      userRole = 'provider';
      console.log('Development mode: Setting role for provider@test.local to provider');
    } else if (email === 'user@test.local') {
      userRole = 'user';
      console.log('Development mode: Setting role for user@test.local to user');
    }
  }
  
  return userRole;
}
