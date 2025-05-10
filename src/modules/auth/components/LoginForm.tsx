
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail } from '../api/auth-api';
import { toast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm = ({ onSuccess, redirectTo = '/' }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@test.local');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        throw new Error('Du må fylle inn både e-post og passord');
      }

      console.log('Attempting login with:', { email });
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
      
      if (user) {
        toast({
          title: 'Innlogget',
          description: 'Du er nå logget inn',
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      } else {
        throw new Error('Kunne ikke logge inn - brukeren ble ikke funnet');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error
        ? err.message
        : 'Feil ved innlogging - sjekk brukernavn og passord';
      
      setError(errorMessage);
      
      toast({
        title: 'Innloggingsfeil',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        {isSubmitting ? 'Logger inn...' : 'Logg inn'}
      </Button>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Har du ikke konto?</span>{' '}
        <Button variant="link" className="p-0" onClick={() => navigate('/register')}>
          Registrer deg
        </Button>
      </div>

      <div className="text-xs text-center text-muted-foreground">
        <p>For utvikling: bruk 'admin@test.local' / 'password'</p>
      </div>
    </form>
  );
};
