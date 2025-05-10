
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from './useAuthState';
import { AuthState } from '../types/types';

interface AuthContextType {
  authState: AuthState;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  },
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { authState, refreshProfile } = useAuthState();

  return (
    <AuthContext.Provider value={{ authState, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
