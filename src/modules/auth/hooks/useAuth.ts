import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthUser, AuthContextType, AuthState } from '../types/unified-types';
import { UserRole, hasRoleLevel, getRoleLevel } from '../normalizeRole';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    userRoles: [],
    isLoading: true,
    error: null,
    isAuthenticated: false,
    role: null,
    refreshProfile: async () => {}
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
          const authUser: AuthUser | null = session?.user ? {
            id: session.user.id,
            email: session.user.email
          } : null;

          setAuthState(prev => ({
            ...prev,
            user: authUser,
            isAuthenticated: !!authUser,
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
      
      const authUser: AuthUser | null = session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null;

      setAuthState(prev => ({
        ...prev,
        user: authUser,
        isAuthenticated: !!authUser,
        isLoading: false,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          profile: null, 
          role: null,
          userRoles: []
        }));
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

      // Create proper UserProfile type with proper casting
      const profileWithTypedMetadata: UserProfile | null = profile ? {
        ...profile,
        metadata: (profile.metadata as UserProfile['metadata']) || {},
        preferences: (profile.preferences as Record<string, any>) || {},
        notification_preferences: (profile.notification_preferences as Record<string, any>) || {},
        ui_preferences: (profile.ui_preferences as Record<string, any>) || {},
        feature_overrides: (profile.feature_overrides as Record<string, any>) || {}
      } : null;

      // Cast metadata from Json to proper type
      const metadata = profileWithTypedMetadata?.metadata;
      const role: UserRole | null = metadata?.role || (profile ? 'user' : null);

      setAuthState(prev => ({
        ...prev,
        profile: profileWithTypedMetadata,
        role,
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
  const role: UserRole | null = authState.role;
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

  const hasRoleLevelMethod = (minLevel: number) => {
    if (!role) return false;
    return getRoleLevel(role) >= minLevel;
  };

  const canAccessModule = (moduleId: string) => {
    return isAdmin;
  };

  const canAccess = canAccessModule;
  const canPerform = (action: string, resource: string) => isAdmin;

  const contextValue: AuthContextType = {
    // Core state
    user: authState.user,
    profile: authState.profile,
    userRoles: authState.userRoles,
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
    hasRoleLevel: hasRoleLevelMethod,
    canAccessModule,
    canAccess,
    canPerform,
    logout,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}