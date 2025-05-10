
import { useAuthContext } from './useAuthContext';
import { useRoleHelpers } from './useRoleHelpers';

/**
 * Main authentication hook that combines authentication state and role helpers
 */
export const useAuth = () => {
  const { authState, refreshProfile } = useAuthContext();
  const { user, profile, isLoading, error } = authState;
  const roleHelpers = useRoleHelpers();

  return {
    user,
    profile,
    isLoading,
    error,
    refreshProfile,
    ...roleHelpers
  };
};

// Re-export AuthProvider for convenience
export { AuthProvider } from './useAuthContext';
