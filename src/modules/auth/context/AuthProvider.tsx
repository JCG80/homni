import React, { useState, useEffect } from 'react';
import { getEnv } from '@/utils/env';
import { getSupabase } from '@/lib/supabaseClient';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from '@/types/auth';
import { log } from '@/utils/logger';

type AuthState = { 
  user: null | { id: string; role: string }; 
  degraded: boolean;
  loading: boolean;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = getEnv();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    degraded: false,
    loading: true
  });

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Try to get Supabase client
        const supabase = getSupabase();
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          log.warn('[AUTH] Session error:', error);
        }
        
        if (mounted) {
          setAuthState({
            user: session?.user ? { id: session.user.id, role: 'user' } : null,
            degraded: false,
            loading: false
          });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                user: session?.user ? { id: session.user.id, role: 'user' } : null,
                loading: false
              }));
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        log.warn('[AUTH] Degraded auth: guest mode aktivert', error);
        if (mounted) {
          setAuthState({
            user: { id: 'guest', role: 'guest' },
            degraded: true,
            loading: false
          });
        }
      }
    };

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Create full context value that matches AuthContextType
  const contextValue: AuthContextType = {
    isAuthenticated: !!authState.user && !authState.degraded,
    user: authState.user,
    profile: null,
    role: (authState.user?.role as any) || null,
    loading: authState.loading,
    isLoading: authState.loading,
    error: null,
    isAdmin: false,
    isMasterAdmin: false,
    isCompany: false,
    isUser: authState.user?.role === 'user',
    isContentEditor: false,
    isGuest: authState.degraded || authState.user?.role === 'guest',
    hasRole: () => false,
    hasRoleLevel: () => false,
    canAccess: () => !authState.degraded,
    canAccessModule: () => !authState.degraded,
    canPerform: () => !authState.degraded,
    refreshProfile: async () => {},
    logout: async () => {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch (error) {
        log.warn('[AUTH] Logout error (degraded mode):', error);
      }
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}