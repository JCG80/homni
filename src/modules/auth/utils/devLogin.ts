
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './roles/types';

export interface TestUser {
  email: string;
  role: UserRole;
  password: string;
  name: string;
}

export interface DevLoginResult {
  success: boolean;
  error?: Error;
  user?: any;
}

// Define test users for quick login during development
export const TEST_USERS: TestUser[] = [
  { email: 'user@test.local', role: 'member', password: 'Test1234!', name: 'Test User' },
  { email: 'company@test.local', role: 'company', password: 'Test1234!', name: 'Test Company' },
  { email: 'admin@test.local', role: 'admin', password: 'Test1234!', name: 'Test Admin' },
  { email: 'master-admin@test.local', role: 'master_admin', password: 'Test1234!', name: 'Test Master Admin' },
  { email: 'provider@test.local', role: 'provider', password: 'Test1234!', name: 'Test Provider' },
];

/**
 * Development-only login function to quickly sign in as different user roles
 * This function will only work in development mode
 */
export const devLogin = async (role: UserRole): Promise<DevLoginResult> => {
  if (import.meta.env.MODE !== 'development') {
    console.error('Dev login is only allowed in development mode');
    return { 
      success: false, 
      error: new Error('Dev login is only allowed in development mode')
    };
  }

  try {
    const user = TEST_USERS.find(user => user.role === role);
    
    if (!user) {
      return { 
        success: false, 
        error: new Error(`No test user found for role: ${role}`) 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) {
      console.error('Dev login error:', error);
      return { success: false, error };
    }

    console.log(`Development login successful as ${role} (${user.email})`);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected error during dev login:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error during dev login')
    };
  }
};

// Setup function to register or confirm test users
export const setupTestUsers = async (): Promise<boolean> => {
  if (import.meta.env.MODE !== 'development') {
    console.error('Setup test users is only allowed in development mode');
    return false;
  }

  try {
    for (const user of TEST_USERS) {
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (!checkError && existingUser) {
        console.log(`User ${user.email} already exists.`);
        continue;
      }
      
      // Create user if doesn't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            role: user.role,
            full_name: user.name
          }
        }
      });
      
      if (signUpError) {
        console.error(`Failed to create user ${user.email}:`, signUpError);
      } else {
        console.log(`Created user ${user.email} with role ${user.role}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up test users:', error);
    return false;
  }
};

// Verify that test users exist in the database
export const verifyTestUsers = async (): Promise<string[]> => {
  if (import.meta.env.MODE !== 'development') {
    return [];
  }

  const missingUsers: string[] = [];

  try {
    for (const user of TEST_USERS) {
      // Try to sign in with each user
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`User ${user.email} does not exist or has invalid credentials.`);
        missingUsers.push(user.email);
      }
    }
  } catch (error) {
    console.error('Error verifying test users:', error);
  }

  return missingUsers;
};
