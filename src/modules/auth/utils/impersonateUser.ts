
import { supabase } from '@/integrations/supabase/client';
import { TestUser } from '../types/types';
import { toast } from '@/hooks/use-toast';
import { smartDevLogin } from './passwordlessLogin';

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
    // Use our smart login that tries passwordless first, then falls back to password
    return await smartDevLogin(user);
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return { success: false, error };
  }
};
