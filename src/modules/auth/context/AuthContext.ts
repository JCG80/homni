import { createContext, useContext } from 'react';
import type { AuthContextType } from '@/types/auth';

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: true,
  isLoading: true,
  error: null,
  isAdmin: false,
  isMasterAdmin: false,
  isCompany: false,
  isUser: false,
  isContentEditor: false,
  isGuest: true,
  hasRole: () => false,
  hasRoleLevel: () => false,
  canAccess: () => false,
  canAccessModule: () => false,
  canPerform: () => false,
  refreshProfile: async () => {},
  logout: async () => {},
});

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}