
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook som gir enkel tilgang til autentiseringsstatus og håndterer lasting
 * @returns Autentiseringsstatus og lasteinformasjon
 */
export const useAuthStatus = () => {
  const { user, profile, isLoading, error, isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(error);
  
  // Sett isReady til true når autentiseringsprosessen er fullført
  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);
  
  // Oppdater siste feil når auth-feil endres
  useEffect(() => {
    if (error) {
      setLastError(error);
    }
  }, [error]);
  
  // Sjekk om brukeren er logget inn som gjest (anonym)
  const isAnonymous = !isAuthenticated;
  
  return {
    isAuthenticated,
    isAnonymous,
    isLoading, 
    isReady,
    user,
    profile,
    error: lastError,
    hasError: !!lastError,
    // Praktiske tilleggsfunksjoner
    isAuthenticating: isLoading && !isReady,
    isInitializing: isLoading && !isReady && !user,
  };
};
