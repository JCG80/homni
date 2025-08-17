
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuthUser, AuthState } from '../types/types';
import { useFetchUserProfile } from './useFetchUserProfile';
import { UserRole } from '../utils/roles/types';
import { toast } from '@/hooks/use-toast';

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

    // Initialize auth state - maximum wait time for loading
    const authTimeout = setTimeout(() => {
      if (mounted && authState.isLoading) {
        console.log('Auth loading timeout exceeded, setting to not loading');
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: null // Don't show error for timeout, just stop loading
        }));
        console.warn("Authentication initialization timed out after 1 seconds");
      }
    }, 1000); // Reduced to 1 second for faster user experience

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`, session ? `User ID: ${session.user.id}` : 'No session');

      if (event === 'INITIAL_SESSION') {
        // We'll handle this in the getSession call
        return;
      }

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
                console.log(`Role determined from profile: ${profile.role}`);
              } else {
                console.warn('No role found in profile, using default');
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
      console.log("getSession result:", session ? `User ID: ${session.user.id}` : 'No session');
      
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
                console.log(`Role determined from profile: ${profile.role}`);
              } else {
                console.warn('No role found in profile, using default');
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
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Function to refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (authState.user) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      try {
        console.log(`Refreshing profile for user: ${authState.user.id}`);
        const profile = await fetchProfile(authState.user.id);
        
        // Update user with role from profile if available
        const updatedUser = { ...authState.user };
        if (profile?.role) {
          updatedUser.role = profile.role;
          console.log(`Updated role from profile refresh: ${profile.role}`);
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
