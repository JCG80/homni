import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail } from '../../api/auth-authentication';
import { toast } from '@/hooks/use-toast';
import { useAuthRetry } from '../../hooks/useAuthRetry';
import { loginSchema, LoginFormValues } from './types';
import { useRoleNavigation } from '../../hooks/roles/useRoleNavigation';

interface UseLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useLoginForm = ({ onSuccess, redirectTo = '/dashboard' }: UseLoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { redirectToDashboard } = useRoleNavigation({ autoRedirect: false });

  // Get return URL either from search params, location state, or use provided redirectTo
  const returnUrl = searchParams.get('returnUrl') || 
                    (location.state?.from?.pathname) || 
                    redirectTo;
  
  console.log("useLoginForm - Return URL:", returnUrl);

  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  // Use retry hook for authentication
  const { 
    isSubmitting, 
    currentAttempt, 
    maxRetries,
    executeWithRetry,
    lastError
  } = useAuthRetry({
    maxRetries: 3,
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        console.log(`useLoginForm - Login successful, redirecting to: ${returnUrl}`);
        
        // If it's a specific path, navigate directly
        if (returnUrl && returnUrl !== '/login' && returnUrl !== '/dashboard') {
          navigate(returnUrl, { replace: true });
        } else {
          // Otherwise, use role-based redirection
          redirectToDashboard();
        }
        
        toast({
          title: 'Innlogget',
          description: 'Du er nå logget inn på din Homni-konto',
          variant: 'default'
        });
      }
    },
    showToasts: true
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);

    console.log('Attempting login with:', { email: values.email });
    
    executeWithRetry(async () => {
      const { user, error: signInError } = await signInWithEmail(values.email, values.password);
      
      if (signInError) {
        console.error('Detailed login error:', signInError);
        
        // Handle specific error cases
        if (signInError instanceof Error) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Feil e-post eller passord. Vennligst prøv igjen.');
          }
          throw signInError;
        } else if (signInError.message) {
          throw new Error(signInError.message);
        } else {
          throw new Error('Feil ved innlogging');
        }
      }
      
      if (!user) {
        throw new Error('Kunne ikke logge inn - brukeren ble ikke funnet');
      }
      
      return user;
    });
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    currentAttempt,
    maxRetries,
    error,
    lastError,
    returnUrl
  };
};
