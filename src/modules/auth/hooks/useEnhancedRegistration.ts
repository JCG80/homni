import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { RegistrationData } from '../components/enhanced/EnhancedRegistrationWizard';
import { logger } from '@/utils/logger';

interface UseEnhancedRegistrationOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useEnhancedRegistration = ({ 
  onSuccess, 
  redirectTo = '/dashboard' 
}: UseEnhancedRegistrationOptions = {}) => {
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
        case 'User already registered':
          return 'En bruker med denne e-postadressen er allerede registrert. Prøv å logge inn i stedet.';
        case 'Invalid email':
          return 'Ugyldig e-postadresse. Vennligst sjekk at du har skrevet riktig.';
        case 'Password should be at least 6 characters':
          return 'Passordet må være minst 6 tegn langt.';
        case 'Email not confirmed':
          return 'E-posten din er ikke bekreftet. Sjekk innboksen din for bekreftelses-e-post.';
        case 'Invalid login credentials':
          return 'Ugyldig e-post eller passord.';
        default:
          return error.message;
      }
    }
    return 'En ukjent feil oppstod. Vennligst prøv igjen.';
  };

  const handleRegistration = useCallback(async (data: RegistrationData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!data.email || !data.password) {
        throw new Error('E-post og passord er påkrevd');
      }

      if (data.password.length < 6) {
        throw new Error('Passordet må være minst 6 tegn langt');
      }

      if (!data.fullName) {
        throw new Error('Navn er påkrevd');
      }

      if (data.userType === 'business' && !data.companyName) {
        throw new Error('Bedriftsnavn er påkrevd for bedriftskontoer');
      }

      // Attempt registration with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
          data: {
            full_name: data.fullName,
            company_name: data.companyName || null,
            phone: data.phoneNumber || null,
            user_type: data.userType,
            marketing_consent: data.marketingConsent || false,
            service_interests: data.serviceInterests || [],
          }
        }
      });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        toast({
          title: "Bekreft e-posten din",
          description: "Vi har sendt en bekreftelses-e-post til deg. Klikk på lenken for å aktivere kontoen din.",
        });
      } else {
        toast({
          title: "Registrering vellykket!",
          description: "Velkommen til Homni! Du kan nå begynne å utforske våre tjenester.",
        });
      }

      // Handle success callback
      if (onSuccess) {
        onSuccess();
      } else {
        // Default navigation based on user type
        const targetPath = data.userType === 'business' 
          ? '/dashboard/company' 
          : '/dashboard';
        navigate(targetPath, { replace: true });
      }

    } catch (err) {
      logger.error('Enhanced registration error', { error: err });
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      toast({
        title: "Registreringsfeil",
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
    handleRegistration,
    clearError
  };
};