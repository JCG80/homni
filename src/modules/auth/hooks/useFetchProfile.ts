
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { withRetry } from '@/utils/apiRetry';

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
          console.error("Error fetching profile:", error);
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        
        return data as Profile;
      }, {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 1.5
      });
      
      return result;
    } catch (error) {
      console.error("Failed to fetch user profile after retries:", error);
      return null;
    }
  }, []);
  
  return { fetchProfile };
};
