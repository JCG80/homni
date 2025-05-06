
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

// We need to create a profiles table in Supabase for this to work
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Check for profile in user metadata first
    const { data: authUser } = await supabase.auth.getUser();
    const userMeta = authUser?.user?.user_metadata;
    
    if (userMeta && userMeta.role) {
      // Create a profile from user metadata if role exists
      return {
        id: userId,
        role: userMeta.role as UserRole,
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
    // Update user metadata to store profile info
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createProfile = async (profile: Omit<Profile, 'created_at'>) => {
  try {
    // Create profile in user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.full_name,
        role: profile.role
      }
    });
    
    if (error) throw error;
    return data;
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
