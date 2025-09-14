import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UseEnhancedLoginOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useEnhancedLogin = ({ 
  onSuccess, 
  redirectTo = '/dashboard' 
}: UseEnhancedLoginOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = (error: any): string => {
    if (error?.message) {
      // Common Supabase auth errors with Norwegian translations
      switch (error.message) {
        case 'Invalid login credentials':
          return 'Ugyldig e-post eller passord. Prøv igjen.';
        case 'Email not confirmed':
          return 'E-posten din er ikke bekreftet. Sjekk innboksen din for bekreftelses-e-post.';
        case 'Too many requests':
          return 'For mange påloggingsforsøk. Vent litt før du prøver igjen.';
        case 'User not found':
          return 'Ingen bruker funnet med denne e-postadressen.';
        case 'Invalid email':
          return 'Ugyldig e-postadresse.';
        default:
          return error.message;
      }
    }
    return 'En ukjent feil oppstod. Vennligst prøv igjen.';
  };

  const handleLogin = useCallback(async (data: LoginData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!data.email || !data.password) {
        throw new Error('E-post og passord er påkrevd');
      }

      // Attempt login with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Handle successful login
      if (authData.user) {
        toast({
          title: "Velkommen tilbake!",
          description: "Du er nå logget inn på Homni.",
        });

        // Handle success callback
        if (onSuccess) {
          onSuccess();
        } else {
          // Default navigation based on user role/type
          const userMetadata = authData.user.user_metadata;
          let targetPath = redirectTo;

          // Determine redirect path based on user type or role
          if (userMetadata?.user_type === 'business') {
            targetPath = '/dashboard/company';
          } else if (userMetadata?.role === 'admin') {
            targetPath = '/admin';
          } else if (userMetadata?.role === 'master_admin') {
            targetPath = '/admin';
          }

          navigate(targetPath, { replace: true });
        }
      }

    } catch (err) {
      logger.error('Enhanced login error', { error: err });
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      toast({
        title: "Påloggingsfeil",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onSuccess, redirectTo, navigate]);

  return {
    isSubmitting,
    error,
    handleLogin,
    clearError
  };
};