
import { UserRole } from './roles/types';
import { supabase } from '@/integrations/supabase/client';

export interface TestUser {
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Add password property
  company_id?: string;
}

export interface DevLoginResult {
  success: boolean;
  error?: Error;
}

export const TEST_USERS: TestUser[] = [
  { name: 'Master Admin', email: 'master@example.com', role: 'master_admin', password: 'default_password' },
  { name: 'Admin', email: 'admin@example.com', role: 'admin', password: 'default_password' },
  { name: 'Company User', email: 'company@example.com', role: 'company', company_id: 'your_company_id', password: 'default_password' },
  { name: 'Member User', email: 'member@example.com', role: 'member', password: 'default_password' },
  { name: 'Regular User', email: 'user@example.com', role: 'user', password: 'default_password' },
];

/**
 * This function is only for development purposes.
 * It allows you to quickly login as a test user.
 */
export const devLogin = async (role: UserRole): Promise<DevLoginResult> => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('devLogin should not be used in production');
    return { success: false, error: new Error('Not in development mode') };
  }

  try {
    // Sign out any existing user
    await supabase.auth.signOut();

    // Find the test user with the given role
    const testUser = TEST_USERS.find(user => user.role === role);
    if (!testUser) {
      throw new Error(`No test user found with role ${role}`);
    }

    // Sign in the test user using their email and a default password
    const { error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password || 'default_password', // Use the password or default
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Dev login error:', error);
    return { success: false, error };
  }
};

// Function to verify if all test users exist
export const verifyTestUsers = async (): Promise<string[]> => {
  try {
    const missingUsers: string[] = [];
    
    for (const user of TEST_USERS) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (error || !data) {
        missingUsers.push(user.email);
      }
    }
    
    return missingUsers;
  } catch (err) {
    console.error('Error verifying test users:', err);
    return TEST_USERS.map(user => user.email);
  }
};
