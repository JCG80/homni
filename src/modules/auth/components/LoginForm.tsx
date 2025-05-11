
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail } from '../api/auth-authentication';
import { toast } from '@/hooks/use-toast';
import { useAuthRetry } from '../hooks/useAuthRetry';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const LoginForm = ({ onSuccess, redirectTo = '/', userType = 'private' }: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@test.local');
  const [password, setPassword] = useState('Test1234!');
  const [error, setError] = useState<string | null>(null);

  // Get redirectUrl from location state or use provided redirectTo
  const from = location.state?.from?.pathname || redirectTo;

  // Use retry hook for authentication
  const { 
    isSubmitting, 
    currentAttempt, 
    maxRetries,
    executeWithRetry 
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
          <AlertDescription>{error}</AlertDescription>
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
          currentAttempt > 0 
            ? `Logger inn... (forsøk ${currentAttempt}/${maxRetries})` 
            : 'Logger inn...'
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

      <div className="text-xs text-center text-muted-foreground">
        <p>For utvikling: bruk '{email}' / '{password}'</p>
      </div>
    </form>
  );
};
