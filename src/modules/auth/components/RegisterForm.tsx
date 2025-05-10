
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUpWithEmail, createProfile } from '../api';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '../utils/roles';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const RegisterForm = ({ onSuccess, redirectTo = '/', userType = 'private' }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user } = await signUpWithEmail(email, password);
      
      if (user) {
        // Create company profile with appropriate role and company details
        const profileData = {
          id: user.id,
          full_name: fullName,
          // For business users, set role to 'company', otherwise 'user' - using proper UserRole type
          role: userType === 'business' ? 'company' as UserRole : 'user' as UserRole,
          // Only include company_name for business users
          ...(userType === 'business' ? { company_name: companyName } : {}),
          // Include phone_number if provided
          ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        };
        
        await createProfile(profileData);
        
        // If it's a business account, also create a company profile entry
        if (userType === 'business') {
          try {
            // Define the type for company profiles insertion
            type CompanyProfileInsert = Database['public']['Tables']['company_profiles']['Insert'];
            
            const { data, error } = await supabase
              .from('company_profiles')
              .insert<CompanyProfileInsert>([
                {
                  name: companyName,
                  user_id: user.id,
                  tags: [],
                  status: 'active'
                }
              ])
              .select('*');
              
            if (error) throw error;
            
            // Add company_id to user profile if company profile was created
            if (data && data[0]) {
              // The company profile was created successfully
              const companyProfile = data[0];
              
              // Use metadata field to store company ID since company_id isn't in the schema
              await supabase
                .from('user_profiles')
                .update({ 
                  metadata: { company_id: companyProfile.id } 
                })
                .eq('id', user.id);
            }
          } catch (companyError) {
            console.error("Error creating company profile:", companyError);
            // Continue with signup even if company profile creation fails
            // The user can still access the system, but with limited company features
          }
        }
        
        toast({
          title: 'Registrering fullført',
          description: userType === 'business' 
            ? 'Din bedriftskonto er opprettet.' 
            : 'Din konto er opprettet.',
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
      
      {userType === 'business' && (
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
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName">{userType === 'business' ? 'Kontaktperson' : 'Fullt navn'}</Label>
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
          placeholder={userType === 'business' ? 'Bedriftens telefonnummer' : 'Ditt telefonnummer (valgfritt)'}
          required={userType === 'business'}
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
