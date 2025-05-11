
import { useAuthSession } from './useAuthSession';
import { useAuthDerivedState } from './useAuthDerivedState';

/**
 * Hook that provides the complete auth state
 * This is the main hook that should be used for auth related functionality
 */
export const useAuthState = () => {
  // Get the auth session state
  const authSession = useAuthSession();
  
  // Get derived state like isAdmin, isUser, etc.
  const derivedState = useAuthDerivedState({
    user: authSession.user,
    profile: authSession.profile
  });
  
  // Combine the states
  return {
    ...authSession,
    ...derivedState,
  };
};
