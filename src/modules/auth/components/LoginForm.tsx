
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail } from '../api/auth-authentication';
import { toast } from '@/hooks/use-toast';
import { useAuthRetry } from '../hooks/useAuthRetry';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TEST_USERS } from '../utils/devLogin';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const LoginForm = ({ onSuccess, redirectTo = '/', userType = 'private' }: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get redirectUrl from location state or use provided redirectTo
  const from = location.state?.from?.pathname || redirectTo;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Du må fylle inn både e-post og passord');
      return;
    }

    console.log('Attempting login with:', { email });
    
    executeWithRetry(async () => {
      const { user, error: signInError } = await signInWithEmail(email, password);
      
      if (signInError) {
        console.error('Detailed login error:', JSON.stringify(signInError));
        
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="din@epost.no"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Passord</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
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
        >
          Registrer deg
        </Button>
      </div>

      {import.meta.env.MODE === 'development' && (
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
  );
};
