
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '../types/types';
import { parseUserProfile } from '../utils/parseUserProfile';

/**
 * Hook for fetching user profile data
 */
export const useFetchUserProfile = () => {
  /**
   * Fetch a user's profile by ID
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log(`Fetching profile for user: ${userId}`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });
      
      // First, try to get the profile from user_profiles
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.warn(`No profile found for user ID: ${userId}. Returning basic profile.`);
        
        // Instead of trying to create a profile, return a basic one
        // This prevents hanging when user doesn't exist in user_profiles yet
        const { data: userData } = await supabase.auth.getUser();
        
        return {
          id: userId,
          user_id: userId,
          email: userData?.user?.email || null,
          full_name: null,
          role: 'member', // Default role
          metadata: { role: 'member' },
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone: null,
          address: null,
          region: null,
          profile_picture_url: null,
          display_name: null
        };
      }
      
      // Check if user_id is missing and update it if necessary
      if (!profileData.user_id) {
        console.warn(`Profile ${userId} has null user_id. Updating...`);
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ user_id: userId })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating user_id in profile:", updateError);
        } else {
          console.log("Successfully updated user_id in profile");
        }
      }

      const parsedProfile = parseUserProfile(profileData);
      
      // Log fetched profile for debugging
      console.log("Fetched and parsed profile:", {
        id: parsedProfile.id,
        role: parsedProfile.role,
        metadata: parsedProfile.metadata
      });
      
      return parsedProfile;
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
      throw error;
    }
  }, []);

  return { fetchProfile };
};
