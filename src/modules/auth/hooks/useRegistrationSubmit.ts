
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail, createProfile } from '../api';
import { toast } from '@/components/ui/use-toast';
import { UserRole, isUserRole } from '../utils/roles';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '../types/types';

interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  phoneNumber?: string;
  userType: 'private' | 'business';
  redirectTo: string;
  onSuccess?: () => void;
}

export const useRegistrationSubmit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RegistrationData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { user } = await signUpWithEmail(data.email, data.password);
      
      if (user) {
        // Set the appropriate role using type guard
        const role: UserRole = data.userType === 'business' ? 'company' : 'user';
        
        if (!isUserRole(role)) {
          throw new Error("Invalid role type");
        }
        
        // Create profile data with correct types
        const profileData: Partial<Profile> & { id: string } = {
          id: user.id,
          full_name: data.fullName,
          role: role,
          email: data.email,
          phone: data.phoneNumber || undefined,
          metadata: {}
        };
        
        await createProfile(profileData);
        
        // If it's a business account, also create a company profile entry
        if (data.userType === 'business' && data.companyName) {
          try {
            // Define the type for company profiles insertion
            type CompanyProfileInsert = {
              name: string;
              user_id: string;
              tags?: string[];
              status?: string;
            };
            
            const { data: companyData, error } = await supabase
              .from('company_profiles')
              .insert<CompanyProfileInsert>([
                {
                  name: data.companyName,
                  user_id: user.id,
                  tags: [],
                  status: 'active'
                }
              ])
              .select('*');
              
            if (error) throw error;
            
            // Add company_id to user profile metadata if company profile was created
            if (companyData && companyData[0]) {
              // The company profile was created successfully
              const companyProfile = companyData[0];
              
              // Update profile with company_id in metadata
              await supabase
                .from('user_profiles')
                .update({ 
                  company_id: companyProfile.id,
                  metadata: { ...profileData.metadata, company_id: companyProfile.id } 
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
          description: data.userType === 'business' 
            ? 'Din bedriftskonto er opprettet.' 
            : 'Din konto er opprettet.',
        });
        
        if (data.onSuccess) {
          data.onSuccess();
        } else {
          navigate(data.redirectTo);
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

  return { handleSubmit, isSubmitting, error };
};
