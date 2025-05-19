
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles/useRoleCheck';

// Create a merged auth context type
interface AuthContextType extends ReturnType<typeof useAuthState>, ReturnType<typeof useRoleCheck> {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();
  const roleCheck = useRoleCheck();
  
  // Merge the contexts
  const mergedContext = {
    ...authState,
    ...roleCheck,
  };
  
  return (
    <AuthContext.Provider value={mergedContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
