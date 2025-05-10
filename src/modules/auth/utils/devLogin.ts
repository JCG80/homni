
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from './roles';

// Define TestUser type and export it
export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
}

// Export test users
export const TEST_USERS: TestUser[] = [
  {
    email: 'user@test.local',
    password: 'test123',
    role: 'user',
    name: 'Test User'
  },
  {
    email: 'company@test.local',
    password: 'test123',
    role: 'company',
    name: 'Test Company'
  },
  {
    email: 'admin@test.local',
    password: 'test123',
    role: 'admin',
    name: 'Test Admin'
  },
  {
    email: 'master-admin@test.local',
    password: 'test123',
    role: 'master-admin',
    name: 'Test Master Admin'
  },
  {
    email: 'provider@test.local',
    password: 'test123',
    role: 'provider',
    name: 'Test Provider'
  },
  {
    email: 'editor@test.local',
    password: 'test123',
    role: 'editor',
    name: 'Test Editor'
  }
];

// Define the return type for devLogin
export interface DevLoginResult {
  success?: boolean;
  error?: {
    message: string;
  };
}

/**
 * Development-only login function
 * This bypasses the normal login flow to enable testing with different roles
 * Only works in development mode
 */
export async function devLogin(role: UserRole): Promise<DevLoginResult> {
  // Ensure we're in development mode for security
  if (import.meta.env.MODE !== 'development') {
    console.error('Dev login is only available in development mode');
    return {
      error: {
        message: 'Dev login is only available in development mode'
      }
    };
  }

  try {
    // Find the test user with the requested role
    const testUser = TEST_USERS.find(user => user.role === role);
    
    if (!testUser) {
      console.error(`No test user found for role: ${role}`);
      return {
        error: {
          message: `No test user found for role: ${role}`
        }
      };
    }
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (error) {
      console.error('Dev login error:', error);
      return {
        error: {
          message: error.message
        }
      };
    }
    
    if (!data.user) {
      console.error('Dev login failed: No user returned');
      return {
        error: {
          message: 'Login failed: No user returned'
        }
      };
    }
    
    console.log(`Dev login success: Logged in as ${role} (${testUser.email})`);
    return {
      success: true
    };
  } catch (err) {
    console.error('Unexpected error during dev login:', err);
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}
