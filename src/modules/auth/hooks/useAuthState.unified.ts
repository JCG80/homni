
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '../api';
import { AuthUser, Profile, AuthState } from '../types/types';
import { isUserRole } from '../utils/roles';

/**
 * Hook for managing authentication state with fallback mechanisms
 */
export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  /**
   * Fetch user profile with fallback error handling
   */
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Primary implementation - use the API
      return await getProfile(userId);
    } catch (primaryError) {
      console.error("Primary profile fetch failed:", primaryError);
      
      try {
        // Fallback implementation - direct database query
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        return data;
      } catch (fallbackError) {
        console.error("Fallback profile fetch also failed:", fallbackError);
        throw fallbackError;
      }
    }
  }, []);

  /**
   * Parse profile data with validation and fallback defaults
   */
  const parseProfileData = (profileData: any): Profile | null => {
    if (!profileData) return null;
  
    try {
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
    } catch (error) {
      console.error("Error parsing profile data:", error);
      // Return minimal valid profile as fallback
      return {
        id: profileData.id,
        role: 'member',
        created_at: profileData.created_at || new Date().toISOString(),
        metadata: {}
      };
    }
  };
  
  /**
   * Refresh the user profile
   */
  const refreshProfile = async () => {
    if (!authState.user) return;
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const profileData = await fetchProfile(authState.user!.id);
      const parsedProfile = parseProfileData(profileData);
      setAuthState(prev => ({ 
        ...prev, 
        profile: parsedProfile, 
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setAuthState(prev => ({ 
            ...prev, 
            user: {
              id: session.user.id,
              email: session.user.email,
            },
            isLoading: true
          }));
          
          // Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            try {
              const profileData = await fetchProfile(session.user.id);
              const parsedProfile = parseProfileData(profileData);
              setAuthState(prev => ({ 
                ...prev, 
                profile: parsedProfile, 
                isLoading: false,
                error: null
              }));
            } catch (error) {
              console.error('Error fetching profile:', error);
              setAuthState(prev => ({ 
                ...prev, 
                error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
                isLoading: false 
              }));
            }
          }, 0);
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    // THEN check for existing session
    const initialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthState(prev => ({ 
          ...prev, 
          user: {
            id: session.user.id,
            email: session.user.email,
          },
          isLoading: true
        }));
        
        try {
          const profileData = await fetchProfile(session.user.id);
          const parsedProfile = parseProfileData(profileData);
          setAuthState(prev => ({ 
            ...prev, 
            profile: parsedProfile, 
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error fetching profile:', error);
          setAuthState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
            isLoading: false 
          }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Calculate derived state
  const isAuthenticated = !!authState.user;
  const role = authState.profile?.role;
  const isAdmin = role === 'admin' || role === 'master_admin';
  const isMasterAdmin = role === 'master_admin';
  const isCompany = role === 'company';
  const isUser = role === 'member';

  return {
    authState,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role,
  };
};

export default useAuthState;
