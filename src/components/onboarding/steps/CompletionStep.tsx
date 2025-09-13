import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, User, Building2, ChevronLeft, Loader2 } from 'lucide-react';
import { UserType } from '../OnboardingWizard';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

interface CompletionStepProps {
  userType: UserType;
  formData: {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    phoneNumber: string;
  };
  selectedPlan: string;
  onComplete: () => void;
  onBack: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  userType,
  formData,
  selectedPlan,
  onComplete,
  onBack,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Feil",
        description: "Bruker ikke funnet. Vennligst logg inn på nytt.",
        variant: "destructive"
      });
      return;
    }

    setIsCompleting(true);

    try {
      // Create or update user profile
      const profileData = {
        id: user.id,
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber || null,
        role: userType,
        metadata: {
          account_type: userType,
          selected_plan: selectedPlan,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        }
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) {
        throw profileError;
      }

      // If company type, create company profile
      if (userType === 'company' && formData.companyName) {
        const companyData = {
          user_id: user.id,
          name: formData.companyName,
          contact_name: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber || null,
          subscription_plan: selectedPlan,
          status: 'active'
        };

        const { error: companyError } = await supabase
          .from('company_profiles')
          .insert([companyData]);

        if (companyError) {
          logger.error('Failed to create company profile', {
            module: 'CompletionStep',
            error: companyError
          });
          // Don't throw - user profile was created successfully
        }
      }

      toast({
        title: "Velkommen til Homni!",
        description: "Din konto er nå klar til bruk.",
        variant: "default"
      });

      onComplete();
    } catch (error) {
      logger.error('Failed to complete onboarding', {
        module: 'CompletionStep',
        userType,
        userId: user.id
      }, error as Error);

      toast({
        title: "Feil ved ferdigstillelse",
        description: "Noe gikk galt. Prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Klar til å fullføre!</h2>
        <p className="text-muted-foreground">
          Gjennomgå informasjonen din og fullfør registreringen
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {userType === 'user' ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            <div>
              <h3 className="font-semibold">
                {userType === 'user' ? 'Privatperson' : 'Bedrift'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formData.fullName}
                {userType === 'company' && formData.companyName && (
                  <span> • {formData.companyName}</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">E-post:</span>
              <span>{formData.email}</span>
            </div>
            
            {formData.phoneNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Telefon:</span>
                <span>{formData.phoneNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan:</span>
              <Badge variant="secondary" className="capitalize">
                {selectedPlan}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">Du får tilgang til:</h4>
          <ul className="space-y-2 text-sm">
            {userType === 'user' ? (
              <>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Administrer dine eiendommer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Send forespørsler om tjenester
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Lagre dokumenter og vedlikehold
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Motta leads fra kunder
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Administrer bedriftsprofil
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Statistikk og rapporter
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isCompleting}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Tilbake
        </Button>
        
        <Button
          onClick={handleComplete}
          disabled={isCompleting}
          className="flex items-center gap-2 min-w-[140px]"
        >
          {isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fullfører...
            </>
          ) : (
            <>
              Fullfør registrering
              <Check className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};