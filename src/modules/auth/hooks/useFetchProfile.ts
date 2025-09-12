
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '../types/types';
import { withRetry } from '@/utils/apiRetry';
import { parseUserProfile } from '../utils/parseUserProfile';
import { logger } from '@/utils/logger';

export const useFetchProfile = () => {
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Use withRetry to handle temporary network issues
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          logger.error('Error fetching profile', { error });
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        
        // Use the parseUserProfile utility to properly convert database data to Profile type
        return parseUserProfile(data);
      }, {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 1.5
      });
      
      return result;
    } catch (error) {
      logger.error('Failed to fetch user profile after retries', { error });
      return null;
    }
  }, []);
  
  return { fetchProfile };
};
