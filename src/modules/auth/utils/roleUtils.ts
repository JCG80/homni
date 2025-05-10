
import { UserRole, ALL_ROLES } from './roles';

/**
 * Determine user role based on metadata or default to basic user
 */
export function determineUserRole(userData: Record<string, any> | null): UserRole {
  if (!userData) {
    return 'user';
  }

  // Extract role from user metadata
  const role = userData.user?.user_metadata?.role;
  
  // Check if we're in development mode and have special test emails
  if (import.meta.env.MODE === 'development' && userData.user?.email) {
    const email = userData.user.email.toLowerCase();
    
    // Map test emails to roles in development
    if (email === 'admin@test.local') return 'master-admin';
    if (email === 'company@test.local') return 'company';
    if (email === 'provider@test.local') return 'provider';
    if (email === 'editor@test.local') return 'editor';
  }
  
  // Validate if the role is a valid UserRole
  if (role && ALL_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  return 'user'; // Default fallback role
}
