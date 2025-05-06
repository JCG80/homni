import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '../api/auth-api';
import { AuthState, Profile, UserRole } from '../types/types';

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<{
  authState: AuthState;
  refreshProfile: () => Promise<void>;
}>({
  authState: initialState,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  const refreshProfile = async () => {
    if (!authState.user) return;
    
    try {
      const profile = await getProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        if (session?.user) {
          setAuthState(prev => ({ 
            ...prev, 
            user: {
              id: session.user.id,
              email: session.user.email,
            },
          }));
          
          try {
            const profile = await getProfile(session.user.id);
            setAuthState(prev => ({ 
              ...prev, 
              profile, 
              isLoading: false 
            }));
          } catch (error) {
            setAuthState(prev => ({ 
              ...prev, 
              error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
              isLoading: false 
            }));
          }
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    // Initial session check
    const initialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthState(prev => ({ 
          ...prev, 
          user: {
            id: session.user.id,
            email: session.user.email,
          },
        }));
        
        try {
          const profile = await getProfile(session.user.id);
          setAuthState(prev => ({ 
            ...prev, 
            profile, 
            isLoading: false 
          }));
        } catch (error) {
          setAuthState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
            isLoading: false 
          }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authState, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const { authState, refreshProfile } = useContext(AuthContext);
  const { user, profile, isLoading, error } = authState;

  return {
    user,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAuthenticated: !!user,
    role: profile?.role || null,
    isUser: profile?.role === 'user',
    isCompany: profile?.role === 'company',
    isAdmin: profile?.role === 'admin' || profile?.role === 'master-admin',
    isMasterAdmin: profile?.role === 'master-admin',
  };
};
