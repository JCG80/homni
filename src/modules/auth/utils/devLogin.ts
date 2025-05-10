
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '../types/types';

/**
 * Development login utility that directly authenticates a test user.
 * Only works in development mode for testing purposes.
 */
export async function devLogin(email: string): Promise<{success: boolean, error?: string}> {
  try {
    // For security, only allow this in development environments
    if (import.meta.env.MODE !== 'development') {
      console.error('Dev login only allowed in development mode');
      return { success: false, error: 'Dev login only allowed in development mode' };
    }
    
    console.log('Attempting dev login with email:', email);
    
    // Try sign in with password first as most reliable method
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: 'password' // Standard test password
    });
    
    if (error) {
      console.warn('Password login failed:', error.message);
      
      // Fall back to OTP (passwordless) login
      const { error: otpError } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: false // Only sign in existing users
        }
      });
      
      if (otpError) {
        console.error('OTP login also failed:', otpError.message);
        return { success: false, error: `Login failed: ${otpError.message}` };
      }
      
      console.log('Dev OTP login sent for:', email);
      return { success: true, error: 'OTP email sent. Check your inbox.' };
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

/**
 * Direct role-based login for development purposes.
 * Allows logging in as a specific role without needing a pre-existing user.
 */
export async function devLoginAs(role: UserRole): Promise<{success: boolean, error?: string}> {
  try {
    // For security, only allow this in development environments
    if (import.meta.env.MODE !== 'development') {
      console.error('Dev login only allowed in development mode');
      return { success: false, error: 'Dev login only allowed in development mode' };
    }
    
    // Find a matching test user for the role
    const matchingUser = TEST_USERS.find(user => user.role === role);
    
    if (!matchingUser) {
      console.error(`No test user found with role: ${role}`);
      return { success: false, error: `No test user found with role: ${role}` };
    }
    
    console.log(`Attempting dev login as ${role} role with user:`, matchingUser.email);
    
    // Use the matching test user to login
    const result = await devLogin(matchingUser.email);
    
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during role-based dev login';
    console.error('Dev login error:', error);
    return { success: false, error };
  }
}

// Available test users - make sure these match what's in your Supabase database
export interface TestUser {
  email: string;
  role: UserRole;
  name: string;
}

export const TEST_USERS: TestUser[] = [
  { email: 'admin@test.local', role: 'master-admin', name: 'Master Admin' },
  { email: 'admin@test.local', role: 'admin', name: 'Admin' }, // Added admin role mapping
  { email: 'provider@test.local', role: 'provider', name: 'Test Provider' },
  { email: 'user@test.local', role: 'user', name: 'Test User' },
  { email: 'company@test.local', role: 'company', name: 'Test Company' }
];
