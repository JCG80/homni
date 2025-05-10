import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { determineUserRole } from '../utils/roleUtils';
import { parseUserProfile } from '../utils/parseUserProfile';

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Fetch user profile from the database
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      console.warn("No profile found for user ID:", userId);
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};
