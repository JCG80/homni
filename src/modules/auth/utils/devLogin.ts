
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../types/types';

export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export const TEST_USERS: TestUser[] = [
  { 
    email: 'user@test.local', 
    password: 'Test1234!', 
    role: 'member',
    name: 'Test User'
  },
  { 
    email: 'company@test.local', 
    password: 'Test1234!', 
    role: 'company',
    name: 'Test Company'
  },
  { 
    email: 'admin@test.local', 
    password: 'Test1234!', 
    role: 'admin',
    name: 'Test Admin'
  },
  { 
    email: 'master@test.local', 
    password: 'Test1234!', 
    role: 'master_admin',
    name: 'Test Master Admin'
  },
  { 
    email: 'provider@test.local', 
    password: 'Test1234!', 
    role: 'provider',
    name: 'Test Provider'
  }
];

export interface DevLoginResult {
  success: boolean;
  error?: Error;
}

/**
 * Helper function to verify if test users exist in the database
 * Returns an array of emails for users that do not exist
 */
export async function verifyTestUsers(): Promise<string[]> {
  const missingUsers: string[] = [];
  
  for (const user of TEST_USERS) {
    try {
      // Try to check if user with this email exists
      // Note: This requires anon access to auth.users which may not be available
      // Using signInWithPassword with a catch is a workaround
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error && error.message.includes('Invalid login credentials')) {
        missingUsers.push(user.email);
        console.warn(`Test user ${user.email} (${user.role}) does not exist or has wrong password`);
      }
    } catch (err) {
      console.error(`Error checking user ${user.email}:`, err);
    }
  }
  
  return missingUsers;
}

/**
 * Helper function for development login with predefined users
 */
export async function devLogin(role: UserRole): Promise<DevLoginResult> {
  try {
    const user = TEST_USERS.find(u => u.role === role);
    if (!user) {
      console.error(`No test user found with role: ${role}`);
      return { 
        success: false, 
        error: new Error(`No test user found with role: ${role}`)
      };
    }

    console.log(`Attempting dev login with: ${user.email} / ${user.password}`);

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) {
      console.error('Dev login error:', error);
      
      // Check if the error indicates that user doesn't exist
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: new Error(`Login failed: Test user '${user.email}' may not exist in the database. Check if test users have been created.`)
        };
      }
      
      toast({
        title: 'Login failed',
        description: `Failed to log in as ${role}: ${error.message}`,
        variant: 'destructive',
      });
      return { success: false, error: error as Error };
    }

    if (data?.user) {
      toast({
        title: 'Login successful',
        description: `Logged in as ${role} (${user.email})`,
      });
      return { success: true };
    }

    return { 
      success: false,
      error: new Error('Login returned no user data')
    };
  } catch (error: any) {
    console.error('Unexpected error in devLogin:', error);
    return { 
      success: false, 
      error: new Error(`Dev login failed: ${error.message}`)
    };
  }
}
