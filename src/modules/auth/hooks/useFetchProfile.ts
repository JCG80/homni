
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseProfileData } from '../utils/profileParser';

/**
 * Hook for fetching user profiles from Supabase
 */
export const useFetchProfile = () => {
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error(profileError.message);
      }

      return parseProfileData(profileData);
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error);
      throw new Error(error.message || "Failed to fetch profile");
    }
  }, []);

  return { fetchProfile };
};
