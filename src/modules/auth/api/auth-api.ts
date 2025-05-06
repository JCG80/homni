
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '../types/types';

// Export supabase client so it can be imported elsewhere
export { supabase };

// Authentication API functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // First try to get profile from the user_profiles table
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profile) {
      // Get user metadata for role information
      const { data: authUser } = await supabase.auth.getUser();
      const userMeta = authUser?.user?.user_metadata;
      
      return {
        id: userId,
        full_name: profile.full_name,
        role: (userMeta?.role as UserRole) || 'user',
        created_at: profile.created_at,
      };
    }
    
    // Fallback: Check for profile in user metadata
    const { data: authUser } = await supabase.auth.getUser();
    const userMeta = authUser?.user?.user_metadata;
    
    if (userMeta && (userMeta.role || userMeta.full_name)) {
      // Create a profile from user metadata if any info exists
      return {
        id: userId,
        role: (userMeta.role as UserRole) || 'user',
        full_name: userMeta.full_name,
        created_at: new Date().toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    // Update both user metadata and user_profiles table
    const { data: authUpdate, error: authError } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (authError) throw authError;
    
    // If there's a full_name update, also update the user_profiles table
    if (updates.full_name) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: userId, 
          full_name: updates.full_name 
        }, { 
          onConflict: 'id' 
        });
      
      if (profileError) throw profileError;
    }
    
    return authUpdate;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createProfile = async (profile: Omit<Profile, 'created_at'>) => {
  try {
    // Create profile in user metadata
    const { data: authUpdate, error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: profile.full_name,
        role: profile.role
      }
    });
    
    if (authError) throw authError;
    
    // Also ensure there's an entry in the user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ 
        id: profile.id, 
        full_name: profile.full_name 
      }, { 
        onConflict: 'id' 
      });
    
    if (profileError) throw profileError;
    
    return authUpdate;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    // Update role in user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { role }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
