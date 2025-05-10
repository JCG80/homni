
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type TestUser = {
  role: string;
  email: string;
  password: string;
  description?: string;
};

export const TEST_USERS: TestUser[] = [
  { role: 'user', email: 'user@test.local', password: 'Test1234!', description: 'Standard user' },
  { role: 'company', email: 'company@test.local', password: 'Test1234!', description: 'Company user' },
  { role: 'admin', email: 'admin@test.local', password: 'Test1234!', description: 'Admin user' },
  { role: 'master-admin', email: 'master-admin@test.local', password: 'Test1234!', description: 'Master admin' }
];

/**
 * Development-only login function for quick testing with different user roles
 * @param role The user role to login as
 */
export const devLogin = async (role: 'user' | 'company' | 'admin' | 'master-admin'): Promise<{ success?: boolean, error?: Error }> => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('Dev login attempted in non-development environment');
    return { error: new Error('Dev login only available in development mode') };
  }

  // Use predefined test users with standardized format: role@test.local / Test1234!
  const email = `${role}@test.local`;
  const password = 'Test1234!';

  try {
    // Show loading toast
    toast({
      title: 'Logging in...',
      description: `Authenticating as ${role}`,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Dev login failed:', error);
      
      // If login fails, try with alternative password format in case environment uses different pattern
      const alternativePassword = 'password';
      const { error: altError } = await supabase.auth.signInWithPassword({
        email, 
        password: alternativePassword
      });

      if (altError) {
        console.error('Alternative dev login also failed:', altError);
        toast({
          title: 'Login failed',
          description: 'Dev login failed. Check console for details.',
          variant: 'destructive',
        });
        return { error: altError };
      }
    }
    
    toast({
      title: 'Login successful',
      description: `Logged in as ${role}`,
    });
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error during dev login:', err);
    toast({
      title: 'Login error',
      description: err instanceof Error ? err.message : 'Unknown error occurred',
      variant: 'destructive',
    });
    return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};

// Helper alias function to match the QuickLogin.tsx import
export const devLoginAs = devLogin;
