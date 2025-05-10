import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { determineUserRole } from '../utils/roleUtils';
import { parseUserProfile } from '../utils/parseUserProfile';
import { UserRole } from '../utils/roles';

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

/**
 * Sign in user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      return { user: null, error };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return { user: null, error };
  }
};

/**
 * Sign up user with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign up error:", error);
      return { user: null, error };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    return { user: null, error };
  }
};

/**
 * Create a user profile
 */
export const createProfile = async (profile: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    return null;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    // First, fetch the current user profile to get the existing metadata
    const { data: profileData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching user profile metadata:", fetchError);
      return false;
    }
    
    // Get current metadata or initialize as empty object if it doesn't exist
    // Ensure it's treated as an object type by using type assertion and checking for null/undefined
    const currentMetadata = profileData?.metadata && typeof profileData.metadata === 'object' 
      ? profileData.metadata 
      : {};
    
    // Update the role in the metadata field, preserving other metadata
    const updatedMetadata = { 
      ...currentMetadata, 
      role: role 
    };
    
    // Now update the profile with the new metadata
    const { error } = await supabase
      .from('user_profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error updating user role:", error);
    return false;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return { error: error instanceof Error ? error : new Error('Unknown error during sign out') };
  }
};
