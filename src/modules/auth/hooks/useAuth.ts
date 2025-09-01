/**
 * Main useAuth hook - provides a clean interface to auth functionality
 * This is the primary hook that components should use for authentication
 */

import { useAuthContext } from './useAuthContext';

export const useAuth = useAuthContext;

// Re-export AuthProvider for convenience
export { AuthProvider } from './useAuthContext';