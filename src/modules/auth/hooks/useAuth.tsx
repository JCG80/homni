
import { useState, useEffect, useCallback, createContext, ReactNode, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, Profile } from '../types/types';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  role: string | undefined;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  refreshProfile: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isMasterAdmin: false,
  isCompany: false,
  isUser: false,
  role: undefined,
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Named export for the useAuth hook
export const useAuth = () => useContext(AuthContext);

const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setAuthState(prevState => ({
          ...prevState,
          isLoading: false,
          error: new Error(profileError.message),
        }));
        return null;
      }

      return profileData;
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error);
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false,
        error: new Error(error.message),
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        const profileData = await fetchProfile(user.id);
        const parsedProfile = parseProfileData(profileData);

        setAuthState({
          user: user,
          profile: parsedProfile,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || undefined,
        };

        fetchProfile(user.id)
          .then(profileData => {
            const parsedProfile = parseProfileData(profileData);

            setAuthState({
              user: user,
              profile: parsedProfile,
              isLoading: false,
              error: null,
            });
          })
          .catch(error => {
            console.error("Error after initial session:", error);
            setAuthState(prevState => ({
              ...prevState,
              isLoading: false,
              error: new Error("Failed to fetch profile after initial session"),
            }));
          });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (authState.user) {
      try {
        const profileData = await fetchProfile(authState.user.id);
        const parsedProfile = parseProfileData(profileData);

        setAuthState(prevState => ({
          ...prevState,
          profile: parsedProfile,
          error: null,
        }));
      } catch (error: any) {
        console.error("Error refreshing profile:", error);
        setAuthState(prevState => ({
          ...prevState,
          error: new Error(error.message),
        }));
        throw error;
      }
    }
  };

  const parseProfileData = (profileData: any): Profile | null => {
    if (!profileData) return null;
  
    const companyId = profileData.company_id || 
      (profileData.metadata && typeof profileData.metadata === 'object' ? 
        profileData.metadata.company_id : undefined);
    
    return {
      id: profileData.id,
      full_name: profileData.full_name,
      role: profileData.role,
      company_id: companyId,
      created_at: profileData.created_at
    };
  };

  // Check if the user is authenticated
  const isAuthenticated = !!authState.user;
  
  // Get the user role
  const role = authState.profile?.role;
  
  // Role-specific checks
  const isAdmin = role === 'admin' || role === 'master-admin';
  const isMasterAdmin = role === 'master-admin';
  const isCompany = role === 'company';
  const isUser = role === 'user';

  return {
    ...authState,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role,
  };
};

// Default export for backward compatibility
export default useAuth;
