
import { createContext, useContext, ReactNode } from 'react';
import { useAuth, ModuleAccess } from './useAuth';
import { AuthUser, AuthState, Profile } from '../types/types';

// For backward compatibility, maintain the old interface
interface AuthContextType {
  authState: AuthState & { module_access: ModuleAccess[] };
  refreshProfile: () => Promise<void>;
}

// Create a backward compatibility context
const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    profile: null,
    isLoading: true,
    error: null,
    module_access: [],
  },
  refreshProfile: async () => {},
});

// AuthProvider component - redirects to the main AuthProvider in useAuth.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the main auth hook
  const auth = useAuth();
  
  // Map to the old format for backward compatibility
  const authState: AuthState & { module_access: ModuleAccess[] } = {
    user: auth.user,
    profile: auth.profile,
    isLoading: auth.isLoading,
    error: auth.error,
    module_access: auth.module_access,
  };
  
  return (
    <AuthContext.Provider value={{ authState, refreshProfile: auth.refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// For backward compatibility
export const useAuthContext = () => useContext(AuthContext);
