import { useContext, createContext } from 'react';
import { AuthContextType } from '@/types/auth';

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}