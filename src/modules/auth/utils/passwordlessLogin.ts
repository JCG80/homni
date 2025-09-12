
import { supabase } from '@/lib/supabaseClient';
import { TestUser } from '../types/types';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export interface LoginResult {
  success: boolean;
  error?: Error;
}

/**
 * Passwordless login for development purposes only
 * This uses a custom login flow that exchanges the test user email for a session
 * without requiring a password, for easier development and testing
 */
export const passwordlessDevLogin = async (user: TestUser): Promise<LoginResult> => {
  if (import.meta.env.MODE !== 'development') {
    logger.warn('passwordlessDevLogin should not be used in production');
    return { 
      success: false, 
      error: new Error('Not in development mode') 
    };
  }

  try {
    // Sign out any existing user first
    await supabase.auth.signOut();
    
    // In development mode, we'll use the supabase admin email sign-in without requiring a password
    // This works because we're in dev mode and we're using a custom Supabase function
    const { data, error } = await supabase.auth.signInWithOtp({
      email: user.email,
    });

    if (error) {
      logger.error('Login error details', { error });
      toast({
        title: 'Login failed',
        description: `Could not log in as ${user.name || user.email}. ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Logged in',
      description: `You are now logged in as ${user.name || user.email} (${user.role})`,
    });

    return { success: true };
  } catch (error: any) {
    logger.error('Login error', { error });
    return { success: false, error };
  }
};

/**
 * Fallback to password-based login when passwordless login fails
 */
export const fallbackPasswordLogin = async (user: TestUser): Promise<LoginResult> => {
  if (!user.password) {
    return { 
      success: false, 
      error: new Error('No password provided for fallback login') 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      logger.error('Fallback login error', { error });
      throw error;
    }

    toast({
      title: 'Fallback login successful',
      description: `You are now logged in as ${user.name || user.email} (${user.role})`,
    });

    return { success: true };
  } catch (error: any) {
    logger.error('Fallback login error', { error });
    return { success: false, error };
  }
};

/**
 * Smart login function that tries passwordless first, then falls back to password auth
 * This ensures maximum flexibility during development
 */
export const smartDevLogin = async (user: TestUser): Promise<LoginResult> => {
  try {
    // Try passwordless login first
    const passwordlessResult = await passwordlessDevLogin(user);
    
    // If passwordless succeeded, we're done
    if (passwordlessResult.success) {
      return passwordlessResult;
    }
    
    logger.info('Passwordless login failed, falling back to password login');
    
    // If passwordless failed and we have a password, try password login
    if (user.password) {
      return fallbackPasswordLogin(user);
    }
    
    // No password and passwordless failed
    return { 
      success: false, 
      error: new Error('Login failed and no password available for fallback') 
    };
  } catch (error: any) {
    logger.error('Smart login error', { error });
    return { success: false, error };
  }
};
