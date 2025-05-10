
import { signInWithEmail } from '../api';
import { TEST_USERS } from '../__tests__/utils/testAuth';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/types';

// Re-export TestUser type from our own types file to avoid importing from test utils
export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  description?: string;
}

// Re-export TEST_USERS for components that need them
export { TEST_USERS };

/**
 * Helper function for development testing to quickly login as different user roles
 * @returns An object with success and error properties
 */
export const devLogin = async (role: UserRole) => {
  // Only enable in development mode
  if (import.meta.env.MODE !== 'development') {
    console.error('Development login is only available in development mode');
    return { success: false, error: new Error('Development login is only available in development mode') };
  }

  const testUser = TEST_USERS.find(user => user.role === role);
  
  if (!testUser) {
    console.error(`No test user found for role: ${role}`);
    toast({
      title: 'Login error',
      description: `No test user found for role: ${role}`,
      variant: 'destructive',
    });
    return { success: false, error: new Error(`No test user found for role: ${role}`) };
  }

  try {
    const { user, error } = await signInWithEmail(testUser.email, testUser.password);
    
    if (error) {
      console.error('Development login error:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
    
    if (user) {
      toast({
        title: 'Development login successful',
        description: `Logged in as ${role} (${testUser.email})`,
      });
      return { success: true, user, error: null };
    }
    
    return { success: false, user: null, error: new Error('Unknown error during login') };
  } catch (err) {
    console.error('Development login error:', err);
    toast({
      title: 'Login error',
      description: err instanceof Error ? err.message : 'Unknown error occurred',
      variant: 'destructive',
    });
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};
