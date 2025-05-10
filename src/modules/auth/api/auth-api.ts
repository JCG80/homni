import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '../types/types';
import { determineUserRole } from '../utils/roleUtils';

// Export supabase client so it can be imported elsewhere
export { supabase };

// Also export the determineUserRole function for testing
export { determineUserRole };

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
  console.log('Attempting login with email:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      return { user: null, error };
    }
    
    console.log('Login successful, user:', data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { user: null, error };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Get user metadata for role information first
    const { data: authUser } = await supabase.auth.getUser();
    const userMeta = authUser?.user?.user_metadata;
    console.log('User metadata from auth:', userMeta);
    
    // Check if the user already has a profile in the database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile from DB:', error);
      
      // If there's no profile in the database, create one based on user metadata
      if (error.code === 'PGRST116') { // Record not found
        console.log('Profile not found in database, creating one...');
        
        // Extract role from metadata or use default
        const userRole = determineUserRole(authUser);
        const fullName = userMeta?.full_name || userMeta?.['full_name'] || 'User';
        
        // Create a new profile in the database
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            full_name: fullName
          });
        
        if (insertError) {
          console.error('Failed to create profile in database:', insertError);
        } else {
          console.log('Created new profile in database');
        }
        
        // Return a profile object with the role from metadata
        return {
          id: userId,
          role: userRole,
          full_name: fullName,
          created_at: new Date().toISOString(),
        };
      }
    }
    
    if (profile) {
      console.log('Found profile in database:', profile);
      
      // Extract role from metadata or use default
      const userRole = determineUserRole(authUser);
      
      return {
        ...profile,
        role: userRole,
      };
    }
    
    // If we reach here, we couldn't get a profile from any source
    console.log('No profile found, returning default with user role');
    return {
      id: userId,
      role: 'user',
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in getProfile:', error);
    // Return minimal profile rather than null to avoid auth failures
    return {
      id: userId,
      role: 'user',
      created_at: new Date().toISOString(),
    };
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
