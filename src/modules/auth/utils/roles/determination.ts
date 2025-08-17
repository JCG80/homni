
/**
 * Role determination from user metadata
 */
import { UserRole } from './types';
import { isUserRole } from './guards';

/**
 * Determine user role based on metadata with fallback
 */
export function determineUserRole(userData: Record<string, any> | null): UserRole {
  try {
    // Primary implementation - from user data
    if (!userData) {
      return 'guest' as UserRole;
    }

    // Extract role from user metadata
    const role = userData.role || 
      (userData.metadata && userData.metadata.role) || 
      (userData.user && userData.user.user_metadata && userData.user.user_metadata.role);
    
    // Check if we're in development mode and have special test emails
    if (import.meta.env.MODE === 'development' && userData.user?.email) {
      const email = userData.user.email.toLowerCase();
      
      // Map test emails to roles in development
      if (email === 'master-admin@test.local' || email === 'master@test.local') return 'master_admin' as UserRole;
      if (email === 'admin@test.local') return 'admin' as UserRole;
      if (email === 'company@test.local' || email === 'provider@test.local') return 'company' as UserRole;
      if (email === 'user@test.local' || email === 'member@test.local') return 'user' as UserRole;
      if (email === 'content@test.local') return 'content_editor' as UserRole;
      if (email === 'anonymous@test.local') return 'guest' as UserRole;
    }
    
    // Validate if the role is a valid UserRole
    if (role && isUserRole(role)) {
      return role as UserRole;
    }
    
    return 'user' as UserRole; // Default fallback role
  } catch (error) {
    console.error('Error determining user role:', error);
    return 'user' as UserRole; // Fallback to default role on error
  }
}
