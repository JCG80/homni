
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, Profile, AuthState } from '../types/types';
import { isUserRole } from '../utils/roles';

/**
 * Hook that manages the authentication state
 */
export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setAuthState(prevState => ({
          ...prevState,
          isLoading: false,
          error: new Error(profileError.message),
        }));
        return null;
      }

      return profileData;
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error);
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: new Error(error.message),
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        const profileData = await fetchProfile(user.id);
        const parsedProfile = parseProfileData(profileData);

        setAuthState({
          user: user,
          profile: parsedProfile,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        fetchProfile(user.id)
          .then(profileData => {
            const parsedProfile = parseProfileData(profileData);

            setAuthState({
              user: user,
              profile: parsedProfile,
              isLoading: false,
              error: null,
            });
          })
          .catch(error => {
            console.error("Error after initial session:", error);
            setAuthState(prevState => ({
              ...prevState,
              isLoading: false,
              error: new Error("Failed to fetch profile after initial session"),
            }));
          });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (authState.user) {
      try {
        const profileData = await fetchProfile(authState.user.id);
        const parsedProfile = parseProfileData(profileData);

        setAuthState(prevState => ({
          ...prevState,
          profile: parsedProfile,
          error: null,
        }));
      } catch (error: any) {
        console.error("Error refreshing profile:", error);
        setAuthState(prevState => ({
          ...prevState,
          error: new Error(error.message),
        }));
        throw error;
      }
    }
  };

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

  // Calculate derived state
  const isAuthenticated = !!authState.user;
  const role = authState.profile?.role;
  const isAdmin = role === 'admin' || role === 'master_admin';
  const isMasterAdmin = role === 'master_admin';
  const isCompany = role === 'company';
  const isUser = role === 'member';

  return {
    ...authState,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role,
  };
};
