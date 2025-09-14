import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/unified-types';
import { UserRole } from '../normalizeRole';
import { AuthContextType } from '@/types/auth';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state with 1-second timeout
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            isLoading: false,
          }));
        }

        // Fetch profile if user exists
        if (session?.user && mounted) {
          fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            error: error as Error,
            isLoading: false,
          }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      setAuthState(prev => ({
        ...prev,
        user: session?.user || null,
        isLoading: false,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, profile: null }));
      }
    });

    // Initialize auth with timeout
    initAuth();
    
    // Force stop loading after 1 second
    const timeout = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }, 1000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        profile: profile || null,
      }));
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const refreshProfile = async () => {
    if (authState.user) {
      await fetchProfile(authState.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Derive computed properties
  const isAuthenticated = !!authState.user;
  const role: UserRole | null = authState.profile?.role || (isAuthenticated ? 'user' : null);
  const isAdmin = role === 'admin' || role === 'master_admin';
  const isMasterAdmin = role === 'master_admin';
  const isCompany = role === 'company';
  const isUser = role === 'user';
  const isContentEditor = role === 'content_editor';
  const isGuest = !isAuthenticated;

  const hasRole = (roleToCheck: UserRole | UserRole[]) => {
    if (!role) return false;
    if (Array.isArray(roleToCheck)) {
      return roleToCheck.includes(role);
    }
    return role === roleToCheck;
  };

  const canAccessModule = (moduleId: string) => {
    return isAdmin || role === 'master_admin';
  };

  const canAccess = canAccessModule;
  const canPerform = (action: string, resource: string) => isAdmin;

  const contextValue: AuthContextType = {
    // Core state
    user: authState.user ? { id: authState.user.id, email: authState.user.email } : null,
    profile: authState.profile,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated,
    role,
    refreshProfile,

    // Derived state
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    isContentEditor,
    isGuest,

    // Aliases
    loading: authState.isLoading,

    // Methods
    hasRole,
    canAccessModule,
    canAccess,
    canPerform,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}