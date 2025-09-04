import { UserRole } from './roles/types';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  company_id?: string;
}

export interface DevLoginResult {
  success: boolean;
  error?: Error;
}

// Make sure these match exactly what's in the database
export const TEST_USERS: TestUser[] = [
  { id: 'master-admin', name: 'Test Master Admin', email: 'master@homni.no', role: 'master_admin', password: 'Test1234!' },
  { id: 'admin', name: 'Test Admin', email: 'admin@homni.no', role: 'admin', password: 'Test1234!' },
  { id: 'content-editor', name: 'Test Content Editor', email: 'content@homni.no', role: 'content_editor', password: 'Test1234!' },
  { id: 'company', name: 'Test Company', email: 'company@homni.no', role: 'company', password: 'Test1234!' },
  { id: 'user', name: 'Test User', email: 'user@homni.no', role: 'user', password: 'Test1234!' },
  { id: 'provider', name: 'Test Provider', email: 'company@homni.no', role: 'company', password: 'Test1234!' }
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

    // Sign in the test user using their email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (error) {
      console.error('Dev login error details:', error);
      toast({
        title: 'Innloggingsfeil',
        description: `Kunne ikke logge inn som ${testUser.role}: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Innlogget',
      description: `Du er nå logget inn som ${testUser.name} (${testUser.role})`,
    });

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
