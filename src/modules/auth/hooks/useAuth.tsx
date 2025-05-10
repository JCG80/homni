
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '../api/auth-api';
import { AuthState, Profile } from '../types/types';
import { UserRole } from '../utils/roles';

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
    console.log('Setting up auth provider...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          console.log('User is authenticated:', session.user.email);
          
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
          console.log('User is not authenticated');
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
  
  // Determine the role - user is either authenticated with a specific role, or anonymous
  const currentRole: UserRole = profile?.role || (user ? 'user' : 'anonymous');

  return {
    user,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAuthenticated: !!user,
    role: currentRole,
    isAnonymous: !user,
    isUser: currentRole === 'user',
    isCompany: currentRole === 'company',
    isAdmin: currentRole === 'admin' || currentRole === 'master-admin',
    isMasterAdmin: currentRole === 'master-admin',
    isProvider: currentRole === 'provider',
    isEditor: currentRole === 'editor',
  };
};
