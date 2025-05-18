
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, AuthState } from '../types/types';
import { useFetchUserProfile } from './useFetchUserProfile';
import { UserRole } from '../utils/roles/types';

/**
 * Hook that manages the auth session state and listens for changes
 */
export const useAuthSession = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const { fetchProfile } = useFetchUserProfile();

  // Set up effect to handle auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip initial session event as we'll handle it separately
      if (event === 'INITIAL_SESSION') {
        return;
      }

      console.log(`Auth state change: ${event}`);

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          role: 'member' as UserRole // Default role until profile is loaded
        };

        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user,
            isLoading: true
          }));
        }

        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(async () => {
          try {
            const profile = await fetchProfile(user.id);
            
            if (mounted) {
              // Update user with role from profile if available
              if (profile?.role) {
                user.role = profile.role;
              }
              
              setAuthState(prev => ({
                ...prev,
                user,
                profile,
                isLoading: false,
                error: null
              }));
            }
          } catch (error) {
            console.error("Error after auth state change:", error);
            
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error("Failed to fetch profile")
              }));
            }
          }
        }, 0);
      } else {
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          role: 'member' as UserRole // Default role until profile is loaded
        };

        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: true
        }));

        fetchProfile(user.id)
          .then(profile => {
            if (mounted) {
              // Update user with role from profile if available
              if (profile?.role) {
                user.role = profile.role;
              }
              
              setAuthState({
                user,
                profile,
                isLoading: false,
                error: null,
              });
            }
          })
          .catch(error => {
            console.error("Error fetching initial profile:", error);
            
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error("Failed to fetch profile")
              }));
            }
          });
      } else if (mounted) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Function to refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (authState.user) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const profile = await fetchProfile(authState.user.id);
        
        // Update user with role from profile if available
        const updatedUser = { ...authState.user };
        if (profile?.role) {
          updatedUser.role = profile.role;
        }
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          profile,
          isLoading: false,
          error: null,
        }));

        return profile;
      } catch (error) {
        console.error("Error refreshing profile:", error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to refresh profile";
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));

        throw error;
      }
    }
  }, [authState.user, fetchProfile]);

  return {
    ...authState,
    refreshProfile,
  };
};
