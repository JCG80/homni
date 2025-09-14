import React from 'react';
import { getEnv } from '@/utils/env';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from '@/types/auth';

type AuthState = { user: null | { id: string; role: string }; degraded: boolean };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = getEnv();

  // "Degraded mode": manglende kritiske env → guest
  const degraded = !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY;
  const value: AuthState = degraded
    ? { user: { id: 'guest', role: 'guest' }, degraded: true }
    : { user: null, degraded: false }; // her kjører du vanlig Supabase-init senere

  if (degraded) {
    console.warn('[AUTH] Degraded auth: guest mode aktivert (manglende env)');
  }

  // Create full context value that matches AuthContextType
  const contextValue: AuthContextType = {
    isAuthenticated: !!value.user,
    user: value.user,
    profile: null,
    role: (value.user?.role as any) || null,
    loading: false,
    isLoading: false,
    error: null,
    isAdmin: false,
    isMasterAdmin: false,
    isCompany: false,
    isUser: false,
    isContentEditor: false,
    isGuest: !value.user || value.user.role === 'guest',
    hasRole: () => false,
    hasRoleLevel: () => false,
    canAccess: () => false,
    canAccessModule: () => false,
    canPerform: () => false,
    refreshProfile: async () => {},
    logout: async () => {},
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}