
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { isUserRole } from '../utils/roles';
import { toast } from '@/hooks/use-toast';

/**
 * Hook that provides functions for fetching and refreshing user profiles
 */
export const useFetchUserProfile = () => {
  /**
   * Fetch a user's profile from Supabase
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }

      return parseProfileData(profileData);
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error);
      return null;
    }
  }, []);

  /**
   * Parse profile data from the database into a typed Profile object
   */
  const parseProfileData = (profileData: any): Profile | null => {
    if (!profileData) return null;
  
    // Extract company_id from metadata if present
    const companyId = profileData.company_id || 
      (profileData.metadata && typeof profileData.metadata === 'object' ? 
        profileData.metadata.company_id : undefined);
    
    // Validate that role is a valid UserRole
    let role = profileData.role;
    if (!isUserRole(role)) {
      console.warn(`Invalid role '${role}' found in profile, defaulting to 'member'`);
      role = 'member';
    }
    
    return {
      id: profileData.id,
      full_name: profileData.full_name,
      role: role,
      company_id: companyId,
      created_at: profileData.created_at,
      metadata: profileData.metadata || {},
      email: profileData.email,
      phone: profileData.phone,
      updated_at: profileData.updated_at
    };
  };

  /**
   * Function to refresh a user's profile
   */
  const refreshUserProfile = async (userId: string): Promise<Profile | null> => {
    if (!userId) {
      return null;
    }
    
    try {
      const profile = await fetchProfile(userId);
      return profile;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to refresh profile";
      
      toast({
        title: "Feil ved oppdatering av profil",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  };

  return {
    fetchProfile,
    refreshUserProfile,
    parseProfileData,
  };
};
