
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Development-only login function for quick testing with different user roles
 * @param role The user role to login as
 */
export const devLogin = async (role: 'user' | 'company' | 'admin' | 'master-admin'): Promise<void> => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('Dev login attempted in non-development environment');
    return;
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
        return;
      }
    }
    
    toast({
      title: 'Login successful',
      description: `Logged in as ${role}`,
    });
  } catch (err) {
    console.error('Unexpected error during dev login:', err);
    toast({
      title: 'Login error',
      description: err instanceof Error ? err.message : 'Unknown error occurred',
      variant: 'destructive',
    });
  }
};
