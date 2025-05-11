
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail } from '../../api/auth-authentication';
import { toast } from '@/hooks/use-toast';
import { useAuthRetry } from '../../hooks/useAuthRetry';
import { loginSchema, LoginFormValues } from './types';

interface UseLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useLoginForm = ({ onSuccess, redirectTo = '/dashboard' }: UseLoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Get redirectUrl from location state or use provided redirectTo
  const from = location.state?.from?.pathname || redirectTo;

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
        console.log('Redirecting after successful login to:', from);
        navigate(from, { replace: true });
        
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
    lastError
  };
};
