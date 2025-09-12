
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '../types/types';
import { toast } from '@/components/ui/use-toast';
import { parseUserProfile } from '../utils/parseUserProfile';
import { UserRole } from '../utils/roles';
import { handleApiError, showErrorToast, showSuccessToast } from './auth-base';
import { logger } from '@/utils/logger';

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
      logger.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      logger.warn("No profile found for user ID", { userId });
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    logger.error("Unexpected error fetching user profile:", error);
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
      logger.error("Error creating profile:", error);
      showErrorToast(
        "Profilfeil",
        "Kunne ikke opprette brukerprofil. Vennligst prøv igjen senere."
      );
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    logger.error("Unexpected error creating profile:", error);
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
      logger.error("Error updating profile:", error);
      showErrorToast(
        "Oppdateringsfeil",
        "Kunne ikke oppdatere brukerprofil. Vennligst prøv igjen senere."
      );
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    logger.error("Unexpected error updating profile:", error);
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
      logger.error("Error updating user role:", error);
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
    logger.error("Unexpected error updating user role:", error);
    return false;
  }
};
