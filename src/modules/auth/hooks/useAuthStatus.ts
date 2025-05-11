
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook som gir enkel tilgang til autentiseringsstatus og håndterer lasting
 * @returns Autentiseringsstatus og lasteinformasjon
 */
export const useAuthStatus = () => {
  const { user, profile, isLoading, error, isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Sett isReady til true når autentiseringsprosessen er fullført
  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);
  
  return {
    isAuthenticated,
    isAnonymous: !isAuthenticated,
    isLoading, 
    isReady,
    user,
    profile,
    error,
    hasError: !!error
  };
};
