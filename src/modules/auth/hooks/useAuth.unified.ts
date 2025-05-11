
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, AuthUser, Profile } from '../types/types';
import { useFetchProfile } from './useFetchProfile';
import { UserRole } from '../utils/roles';
import { isUserRole } from '../utils/roles';
import { toast } from '@/hooks/use-toast';

/**
 * Unified hook for auth state management.
 * Consolidates functionality from different auth state implementations.
 */
export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const { fetchProfile } = useFetchProfile();

  // Helper function to check if user has a specific role
  const hasRole = useCallback((role: UserRole) => {
    return authState.profile?.role === role;
  }, [authState.profile]);

  // Helper functions to check common roles
  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('master_admin');
  }, [hasRole]);

  const isMasterAdmin = useCallback(() => {
    return hasRole('master_admin');
  }, [hasRole]);

  const isCompany = useCallback(() => {
    return hasRole('company');
  }, [hasRole]);

  const isUser = useCallback(() => {
    return hasRole('user');
  }, [hasRole]);

  // Refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!authState.user?.id) return;
    
    try {
      const profile = await fetchProfile(authState.user.id);
      if (profile) {
        setAuthState(prev => ({ ...prev, profile }));
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
      toast({
        title: "Feil ved oppdatering av profil",
        description: err instanceof Error ? err.message : "Ukjent feil oppstod",
        variant: "destructive",
      });
    }
  }, [authState.user?.id, fetchProfile]);

  // Load user and profile on mount and auth changes
  useEffect(() => {
    let mounted = true;

    // Check current auth state
    const loadInitialUser = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // Update state with user from session
        if (session?.user && mounted) {
          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email,
            role: 'user' // Default role until profile is loaded
          };

          setAuthState(prev => ({ ...prev, user, isLoading: true }));

          // Fetch user profile
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
                isLoading: false 
              }));
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            if (mounted) {
              setAuthState(prev => ({ 
                ...prev, 
                error: profileError instanceof Error ? profileError : new Error("Failed to fetch profile"), 
                isLoading: false 
              }));
            }
          }
        } else if (mounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setAuthState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error : new Error("Authentication initialization failed"), 
            isLoading: false 
          }));
        }
      }
    };

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            const user: AuthUser = {
              id: session.user.id,
              email: session.user.email,
              role: 'user' // Default role until profile is loaded
            };
            
            setAuthState(prev => ({ ...prev, user, isLoading: true }));
            
            // Important: Use setTimeout to avoid potential deadlocks with Supabase auth
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
                      isLoading: false 
                    }));
                  }
                } catch (error) {
                  console.error("Error fetching profile after auth change:", error);
                  if (mounted) {
                    setAuthState(prev => ({ 
                      ...prev, 
                      error: error instanceof Error ? error : new Error("Failed to fetch profile"), 
                      isLoading: false 
                    }));
                  }
                }
              }, 0);
            }
          } else {
            // User is signed out
            setAuthState({
              user: null,
              profile: null,
              isLoading: false,
              error: null,
            });
          }
        }
      }
    );

    // Load initial user state
    loadInitialUser();

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    ...authState,
    isAuthenticated: !!authState.user,
    isAdmin: isAdmin(),
    isMasterAdmin: isMasterAdmin(),
    isCompany: isCompany(),
    isUser: isUser(),
    role: authState.profile?.role,
    refreshProfile,
  };
};
