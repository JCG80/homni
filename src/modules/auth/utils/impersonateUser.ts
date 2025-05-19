
import { supabase } from '@/integrations/supabase/client';
import { TestUser } from '../types/types';
import { toast } from '@/hooks/use-toast';

export interface ImpersonationResult {
  success: boolean;
  error?: Error;
}

/**
 * Impersonates a user by setting their session in Supabase Auth
 * This function is only for development purposes
 */
export const impersonateUser = async (user: TestUser): Promise<ImpersonationResult> => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('impersonateUser should not be used in production');
    return { 
      success: false, 
      error: new Error('Not in development mode') 
    };
  }

  try {
    // Sign out any existing user
    await supabase.auth.signOut();

    // For development, we'll use the existing devLogin function
    // which signs in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      console.error('Impersonation error details:', error);
      throw error;
    }

    toast({
      title: 'Impersonation successful',
      description: `You are now logged in as ${user.name || user.email} (${user.role})`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return { success: false, error };
  }
};
