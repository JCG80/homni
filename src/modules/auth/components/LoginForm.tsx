
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail } from '../api/auth-authentication';
import { toast } from '@/hooks/use-toast';
import { useAuthRetry } from '../hooks/useAuthRetry';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TEST_USERS } from '../utils/devLogin';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Vennligst skriv inn en gyldig e-post'),
  password: z.string().min(6, 'Passordet må være minst 6 tegn')
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const LoginForm = ({ onSuccess, redirectTo = '/dashboard', userType = 'private' }: LoginFormProps) => {
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
      
      toast({
        title: 'Innlogget',
        description: 'Du er nå logget inn',
      });
      
      return user;
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {lastError && !error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{lastError.message}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-post</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="din@epost.no" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passord</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {currentAttempt > 0 
                ? `Logger inn... (forsøk ${currentAttempt}/${maxRetries})` 
                : 'Logger inn...'}
            </div>
          ) : (
            'Logg inn'
          )}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Har du ikke konto?</span>{' '}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate(userType === 'business' ? '/register?type=business' : '/register')}
            type="button"
          >
            Registrer deg
          </Button>
        </div>

        {import.meta.env.MODE === 'development' && TEST_USERS && (
          <div className="text-xs mt-4">
            <details className="text-muted-foreground">
              <summary className="cursor-pointer">Dev info</summary>
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p>Test users should have the following credentials:</p>
                <ul className="list-disc pl-4 mt-1">
                  {TEST_USERS.map(user => (
                    <li key={user.email} className="text-xs">
                      {user.role}: {user.email} / {user.password}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">Run <code>window.setupTestUsers()</code> in console to create these users.</p>
              </div>
            </details>
          </div>
        )}
      </form>
    </Form>
  );
};
