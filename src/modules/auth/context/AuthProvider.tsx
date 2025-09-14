import React, { useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { UserProfile } from '../types/unified-types';
import type { UserRole } from '../normalizeRole';
import type { AuthContextType, LightUser } from '@/types/auth';
import { getRoleLevel } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

// Role level mapping - adjust based on your priorities
const roleLevels: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  content_editor: 2,
  company: 3,
  admin: 4,
  master_admin: 5
};

/**
 * Auth Provider component that provides authentication context to the app
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Helper function for mapping to LightUser
  const toLightUser = (user: User | null): LightUser | null => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? null
    };
  };
  
  useEffect(() => {
    let mounted = true;
    
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

        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            profile: profile as UserProfile || null,
          }));
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            isLoading: false,
          }));
        }

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

    initAuth();
    
    const timeout = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }, 1000);

    return () => {
      mounted = false;
      subscription?.unsubscribe(); // Optional chaining
      clearTimeout(timeout);
    };
  }, []);

  const refreshProfile = async () => {
    if (authState.user) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();

      if (!error) {
        setAuthState(prev => ({ ...prev, profile: profile as UserProfile }));
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!authState.user;
  const role: UserRole | null = (authState.profile?.role as UserRole) || (isAuthenticated ? 'user' as UserRole : null);
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

  const hasRoleLevel = (minLevel: number): boolean => {
    if (!role) return false;
    return (roleLevels[role] || 0) >= minLevel;
  };

  const canAccessModule = (moduleId: string) => {
    return isAdmin;
  };

  const canAccess = canAccessModule;
  const canPerform = (action: string, resource: string) => isAdmin;

  const contextValue: AuthContextType = {
    // Core state
    user: toLightUser(authState.user),
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
    hasRoleLevel,
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
};