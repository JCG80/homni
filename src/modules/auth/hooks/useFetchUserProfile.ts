
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      // First, try to get the profile from user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.warn(`No profile found for user ID: ${userId}. Will attempt to create one.`);
        
        // Get user data to help create a profile
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("Could not get user data to create profile");
          return null;
        }
        
        // Create a new profile with basic data
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            user_id: userId,
            email: userData.user.email,
            metadata: { role: 'member' }, // Default role
          }])
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating new profile:", createError);
          throw createError;
        }
        
        console.log("Created new profile for user:", newProfile);
        return parseUserProfile(newProfile);
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
