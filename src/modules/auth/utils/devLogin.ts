
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '../types/types';

/**
 * Development login utility that directly authenticates a test user with password.
 * Only works in development mode for testing purposes.
 * @param email Predefined test user email
 */
export async function devLogin(email: string): Promise<{success: boolean, error?: string}> {
  try {
    // For security, only allow this in development environments
    if (import.meta.env.MODE !== 'development') {
      console.error('Dev login only allowed in development mode');
      return { success: false, error: 'Dev login only allowed in development mode' };
    }
    
    console.log('Attempting dev login with email:', email);
    
    // Sign in with predefined password for test users
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: 'password' 
    });
    
    if (error) {
      console.error('Error during dev login:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Dev login successful for:', email, 'User:', data.user);
    console.log('User metadata:', data.user?.user_metadata);
    
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
  { email: 'admin@test.local', role: 'master-admin', name: 'Master Admin' },
  { email: 'provider@test.local', role: 'provider', name: 'Test Provider' },
  { email: 'user@test.local', role: 'user', name: 'Test User' }
];
