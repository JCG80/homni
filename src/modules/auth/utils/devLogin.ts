
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '../types/types';

// This function is only meant to be used during development for quick testing
export const devLogin = async (email: string): Promise<{success: boolean, error?: string}> => {
  try {
    // For security, only allow this in development environments
    if (import.meta.env.MODE !== 'development') {
      console.error('Dev login only allowed in development mode');
      return { success: false, error: 'Dev login only allowed in development mode' };
    }
    
    // Sign in with the test account - uses password from SQL migration
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Test1234!' // This is the password we set in the SQL migration
    });
    
    if (error) {
      console.error('Error during dev login:', error.message);
      return { success: false, error: error.message };
    }
    
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
