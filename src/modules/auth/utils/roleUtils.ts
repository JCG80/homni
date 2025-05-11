
import { UserRole } from '../types/types';
import { isUserRole } from './roles';

/**
 * Determine user role based on metadata or default to member
 */
export function determineUserRole(userData: Record<string, any> | null): UserRole {
  if (!userData) {
    return 'member';
  }

  // Extract role from user metadata
  const role = userData.user?.user_metadata?.role;
  
  // Check if we're in development mode and have special test emails
  if (import.meta.env.MODE === 'development' && userData.user?.email) {
    const email = userData.user.email.toLowerCase();
    
    // Map test emails to roles in development
    if (email === 'admin@test.local') return 'master_admin';
    if (email === 'company@test.local') return 'company';
    if (email === 'provider@test.local') return 'provider';
    if (email === 'editor@test.local') return 'editor';
    if (email === 'user@test.local') return 'member';
  }
  
  // Validate if the role is a valid UserRole
  if (role && isUserRole(role)) {
    return role as UserRole;
  }
  
  return 'member'; // Default fallback role
}
