
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuthUser, AuthState } from '../types/types';
import { useFetchUserProfile } from './useFetchUserProfile';
import { UserRole, normalizeRole } from '../normalizeRole';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Hook that manages the auth session state and listens for changes
 */
export const useAuthSession = () => {
  console.log('[EMERGENCY useAuthSession] Hook initialized');
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

    // EMERGENCY: Timeout removed to prevent conflicts with AuthWrapper
    // Initialize auth state - timeout managed by AuthWrapper now

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[EMERGENCY useAuthSession] Auth state change:', { event, hasUser: !!session?.user });

      if (event === 'INITIAL_SESSION') {
        // We'll handle this in the getSession call
        return;
      }

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          role: 'user' as UserRole // Default role until profile is loaded
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
              if (profile?.role || profile?.metadata?.role) {
                user.role = normalizeRole(profile.role || profile.metadata?.role);
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
            logger.error('Error after auth state change', { error });
            
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error("Failed to fetch profile")
              }));
              
              toast({
                title: "Authentication Error",
                description: "There was a problem loading your profile",
                variant: "destructive"
              });
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
      console.log('[EMERGENCY useAuthSession] Got existing session:', { hasUser: !!session?.user });
      
      if (session?.user && mounted) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          role: 'user' as UserRole // Default role until profile is loaded
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
              if (profile?.role || profile?.metadata?.role) {
                user.role = normalizeRole(profile.role || profile.metadata?.role);
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
            logger.error('Error fetching initial profile', { error });
            
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error("Failed to fetch profile")
              }));
              
              toast({
                title: "Profile Error",
                description: "There was a problem loading your profile data",
                variant: "destructive"
              });
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
        if (profile?.role || profile?.metadata?.role) {
          updatedUser.role = normalizeRole(profile.role || profile.metadata?.role);
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
        logger.error('Error refreshing profile', { error });
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to refresh profile";
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));
        
        toast({
          title: "Profile Refresh Error",
          description: errorMessage,
          variant: "destructive"
        });

        throw error;
      }
    }
  }, [authState.user, fetchProfile]);

  return {
    ...authState,
    refreshProfile,
  };
};
