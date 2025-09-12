
import { supabase } from '@/lib/supabaseClient';
import { QuickLoginUser } from '../types/unified-types';
import { toast } from '@/components/ui/use-toast';
import { smartDevLogin } from './passwordlessLogin';
import { logger } from '@/utils/logger';

export interface ImpersonationResult {
  success: boolean;
  error?: Error;
}

/**
 * Impersonates a user by setting their session in Supabase Auth
 * This function is only for development purposes
 */
export const impersonateUser = async (user: QuickLoginUser): Promise<ImpersonationResult> => {
  if (import.meta.env.MODE !== 'development') {
    logger.warn('impersonateUser should not be used in production');
    return { 
      success: false, 
      error: new Error('Not in development mode') 
    };
  }

  try {
    // Use our smart login that tries passwordless first, then falls back to password
    return await smartDevLogin(user);
  } catch (error: any) {
    logger.error('Impersonation error', { error });
    return { success: false, error };
  }
};
