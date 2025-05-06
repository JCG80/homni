
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '../types/types';

/**
 * Sender en magic-link på e-post ved dev-login.
 * @param email Testbrukerens e-post
 */
export async function devLogin(email: string): Promise<{success: boolean, error?: string}> {
  try {
    // For security, only allow this in development environments
    if (import.meta.env.MODE !== 'development') {
      console.error('Dev login only allowed in development mode');
      return { success: false, error: 'Dev login only allowed in development mode' };
    }
    
    // Send a magic link to the email
    const { error } = await supabase.auth.signInWithOtp({ email });
    
    if (error) {
      console.error('Error during dev login:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Magic link sent! Check network tab or Supabase logs for the login URL.');
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during dev login';
    console.error('Dev login error:', error);
    return { success: false, error };
  }
};

// Available test users
export interface TestUser {
  email: string;
  role: UserRole;
  name: string;
}

export const TEST_USERS: TestUser[] = [
  { email: 'admin@test.local', role: 'master-admin', name: 'Admin User' },
  { email: 'company@test.local', role: 'company', name: 'Provider User' },
  { email: 'user@test.local', role: 'user', name: 'Regular User' }
];
