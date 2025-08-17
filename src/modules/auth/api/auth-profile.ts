
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '../types/types';
import { toast } from '@/hooks/use-toast';
import { parseUserProfile } from '../utils/parseUserProfile';
import { UserRole } from '../utils/roles';
import { handleApiError, showErrorToast, showSuccessToast } from './auth-base';

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
      .maybeSingle();
    
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

/**
 * Create a user profile
 */
export const createProfile = async (profile: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  try {
    // Ensure user_id is set to id if not provided (required by new schema)
    const profileData = {
      ...profile,
      user_id: profile.user_id || profile.id
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      showErrorToast(
        "Profilfeil",
        "Kunne ikke opprette brukerprofil. Vennligst prøv igjen senere."
      );
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    return null;
  }
};

/**
 * Update a user profile
 */
export const updateProfile = async (profileData: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', profileData.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      showErrorToast(
        "Oppdateringsfeil",
        "Kunne ikke oppdatere brukerprofil. Vennligst prøv igjen senere."
      );
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    return null;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    // Get current metadata to preserve other fields
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();

    const currentMetadata = (currentProfile?.metadata && typeof currentProfile.metadata === 'object') 
      ? currentProfile.metadata as Record<string, any>
      : {};
    const updatedMetadata = { ...currentMetadata, role };

    // Update both the direct role column and metadata for backward compatibility
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: role,
        metadata: updatedMetadata
      })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user role:", error);
      showErrorToast(
        "Rolleendringsfeil",
        "Kunne ikke oppdatere brukerrolle."
      );
      return false;
    }
    
    showSuccessToast(
      "Rolle oppdatert",
      `Bruker ${userId} har fått rollen ${role}.`
    );
    
    return true;
  } catch (error) {
    console.error("Unexpected error updating user role:", error);
    return false;
  }
};
