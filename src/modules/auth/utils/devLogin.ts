
import { signInWithEmail } from '../api';
import { TEST_USERS } from '../__tests__/utils/testAuth';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/types';

/**
 * Helper function for development testing to quickly login as different user roles
 */
export const devLogin = async (role: UserRole) => {
  // Only enable in development mode
  if (import.meta.env.MODE !== 'development') {
    console.error('Development login is only available in development mode');
    return;
  }

  const testUser = TEST_USERS.find(user => user.role === role);
  
  if (!testUser) {
    console.error(`No test user found for role: ${role}`);
    toast({
      title: 'Login error',
      description: `No test user found for role: ${role}`,
      variant: 'destructive',
    });
    return;
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
      return;
    }
    
    if (user) {
      toast({
        title: 'Development login successful',
        description: `Logged in as ${role} (${testUser.email})`,
      });
    }
  } catch (err) {
    console.error('Development login error:', err);
    toast({
      title: 'Login error',
      description: err instanceof Error ? err.message : 'Unknown error occurred',
      variant: 'destructive',
    });
  }
};
