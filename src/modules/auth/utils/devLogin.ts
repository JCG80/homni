
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
      toast({
        title: 'Login failed',
        description: `Failed to log in as ${role}: ${error.message}`,
        variant: 'destructive',
      });
      return { success: false, error };
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
