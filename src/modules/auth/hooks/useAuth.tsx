
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
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const profile = await getProfile(authState.user!.id);
      setAuthState(prev => ({ ...prev, profile, isLoading: false }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        console.log('User metadata:', session?.user?.user_metadata);
        
        if (session?.user) {
          setAuthState(prev => ({ 
            ...prev, 
            user: {
              id: session.user.id,
              email: session.user.email,
            },
            isLoading: true
          }));
          
          // Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            try {
              const profile = await getProfile(session.user.id);
              console.log('Retrieved profile:', profile);
              setAuthState(prev => ({ 
                ...prev, 
                profile, 
                isLoading: false 
              }));
            } catch (error) {
              console.error('Error fetching profile:', error);
              setAuthState(prev => ({ 
                ...prev, 
                error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
                isLoading: false 
              }));
            }
          }, 0);
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

    // THEN check for existing session
    const initialSession = async () => {
      console.log('Checking for initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Found initial session for user:', session.user.id);
        console.log('User metadata:', session?.user?.user_metadata);
        
        setAuthState(prev => ({ 
          ...prev, 
          user: {
            id: session.user.id,
            email: session.user.email,
          },
          isLoading: true
        }));
        
        try {
          const profile = await getProfile(session.user.id);
          console.log('Retrieved profile:', profile);
          setAuthState(prev => ({ 
            ...prev, 
            profile, 
            isLoading: false 
          }));
        } catch (error) {
          console.error('Error fetching profile:', error);
          setAuthState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error : new Error('Failed to fetch profile'), 
            isLoading: false 
          }));
        }
      } else {
        console.log('No initial session found');
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
    isProvider: profile?.role === 'provider',
  };
};
