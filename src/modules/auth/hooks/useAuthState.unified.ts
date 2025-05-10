
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, AuthUser } from '../types/types';
import { useFetchProfile } from './useFetchProfile';
import { useAuthDerivedState } from './useAuthDerivedState';

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

  const { fetchProfile } = useFetchProfile();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: true
        }));

        // Use setTimeout to avoid potential deadlock
        setTimeout(async () => {
          try {
            const profile = await fetchProfile(user.id);
            setAuthState(prev => ({
              ...prev,
              profile,
              isLoading: false,
              error: null
            }));
          } catch (error: any) {
            console.error("Error after session change:", error);
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: new Error(error.message || "Failed to fetch profile")
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
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: true
        }));

        fetchProfile(user.id)
          .then(profile => {
            setAuthState({
              user,
              profile,
              isLoading: false,
              error: null,
            });
          })
          .catch(error => {
            console.error("Error after initial session:", error);
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: new Error(error.message || "Failed to fetch profile")
            }));
          });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (authState.user) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const profile = await fetchProfile(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          profile,
          isLoading: false,
          error: null,
        }));
      } catch (error: any) {
        console.error("Error refreshing profile:", error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: new Error(error.message || "Failed to refresh profile"),
        }));
      }
    }
  }, [authState.user, fetchProfile]);

  // Get derived state like isAdmin, isUser, etc.
  const derivedState = useAuthDerivedState({
    user: authState.user,
    profile: authState.profile
  });

  return {
    ...authState,
    ...derivedState,
    refreshProfile,
  };
};
