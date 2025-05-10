
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUpWithEmail, createProfile } from '../api';
import { toast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const RegisterForm = ({ onSuccess, redirectTo = '/' }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user } = await signUpWithEmail(email, password);
      
      if (user) {
        // Create profile with default 'user' role
        await createProfile({
          id: user.id,
          full_name: fullName,
          role: 'user',
        });
        
        toast({
          title: 'Registrering fullført',
          description: 'Din konto er opprettet.',
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feil ved registrering');
      toast({
        title: 'Registreringsfeil',
        description: error || 'Kunne ikke opprette konto',
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
        <Label htmlFor="fullName">Fullt navn</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Ola Nordmann"
        />
      </div>
      
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
          minLength={6}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Registrerer...' : 'Registrer'}
      </Button>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Har du allerede en konto?</span>{' '}
        <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
          Logg inn
        </Button>
      </div>
    </form>
  );
};
