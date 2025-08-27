import { useContext } from 'react';
import { AuthContext } from './useAuthContext';

// Re-export AuthProvider from useAuthContext to avoid duplication
export { AuthProvider } from './useAuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};