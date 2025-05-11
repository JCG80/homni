
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useRegistrationSubmit } from '../../hooks/useRegistrationSubmit';

interface BusinessRegistrationFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const BusinessRegistrationForm = ({ 
  onSuccess, 
  redirectTo = '/'
}: BusinessRegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { isSubmitting, error, handleSubmit: submitRegistration } = useRegistrationSubmit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitRegistration({
      email,
      password,
      fullName,
      companyName,
      phoneNumber,
      userType: 'business',
      redirectTo,
      onSuccess
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
        <Label htmlFor="companyName">Bedriftsnavn</Label>
        <Input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          placeholder="Bedrift AS"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Kontaktperson</Label>
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
        <Label htmlFor="phoneNumber">Telefonnummer</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Bedriftens telefonnummer"
          required
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
    </form>
  );
};
