
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, AuthUser } from '../types/types';
import { useFetchProfile } from './useFetchProfile';
import { useAuthDerivedState } from './useAuthDerivedState';
import { toast } from '@/hooks/use-toast';

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
              setAuthState(prev => ({
                ...prev,
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
        };

        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: true
        }));

        fetchProfile(user.id)
          .then(profile => {
            if (mounted) {
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
        setAuthState(prev => ({
          ...prev,
          profile,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Error refreshing profile:", error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to refresh profile";
        
        toast({
          title: "Feil ved oppdatering av profil",
          description: errorMessage,
          variant: "destructive",
        });
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
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
