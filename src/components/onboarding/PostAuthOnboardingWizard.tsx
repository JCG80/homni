import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useLinkAnonymousLeads } from '@/hooks/useLinkAnonymousLeads';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

interface PostAuthOnboardingWizardProps {
  onComplete: () => void;
}

export const PostAuthOnboardingWizard = ({ onComplete }: PostAuthOnboardingWizardProps) => {
  const { user, profile } = useAuth();
  const { linkLeads, linkedCount, isLinking } = useLinkAnonymousLeads();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: 'Koble tidligere forespørsler',
      description: 'Vi sjekker om du har sendt forespørsler før du opprettet konto',
      action: 'link-leads'
    },
    {
      id: 2,
      title: 'Profil ferdigstilt',
      description: 'Din profil er klar for bruk',
      action: 'profile-complete'
    },
    {
      id: 3,
      title: 'Kom i gang',
      description: 'Alt er klart - utforsk dine muligheter',
      action: 'complete'
    }
  ];

  useEffect(() => {
    if (user?.email) {
      handleLinkLeads();
    }
  }, [user?.email]);

  const handleLinkLeads = async () => {
    if (!user?.email) return;
    
    try {
      const count = await linkLeads(user.id, user.email);
      if (count > 0) {
        toast({
          title: "Forespørsler koblet!",
          description: `${count} tidligere forespørsel${count > 1 ? 'er' : ''} ble koblet til din konto.`,
          variant: "default"
        });
      }
      setCompletedSteps(prev => [...prev, 1]);
      setTimeout(() => setCurrentStep(2), 1000);
    } catch (error) {
      console.error('Error linking leads:', error);
      setCompletedSteps(prev => [...prev, 1]);
      setTimeout(() => setCurrentStep(2), 1000);
    }
  };

  const handleNextStep = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleComplete = () => {
    toast({
      title: "Velkommen til Homni!",
      description: "Din konto er nå klar for bruk. Du kan nå sende nye forespørsler og følge opp eksisterende.",
      variant: "default"
    });
    onComplete();
  };

  const renderStepContent = () => {
    const step = steps[currentStep - 1];
    
    switch (step.action) {
      case 'link-leads':
        return (
          <div className="text-center space-y-4">
            {isLinking ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Kobler forespørsler til din konto...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                {linkedCount > 0 ? (
                  <>
                    <p className="font-medium text-green-900">
                      {linkedCount} forespørsel{linkedCount > 1 ? 'er' : ''} koblet!
                    </p>
                    <p className="text-muted-foreground">
                      Du kan nå se status på alle dine forespørsler i dashboardet
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Ingen tidligere forespørsler funnet</p>
                    <p className="text-muted-foreground">
                      Du kan sende din første forespørsel når som helst
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        );
        
      case 'profile-complete':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
            <div className="space-y-2">
              <p className="font-medium">Profil opprettet!</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Navn:</strong> {profile?.full_name || user?.email}</p>
                <p><strong>E-post:</strong> {user?.email}</p>
                <p><strong>Kontotype:</strong> {profile?.role === 'company' ? 'Bedrift' : 'Privat'}</p>
              </div>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Alt er klart!</h3>
              <p className="text-muted-foreground">
                Din konto er satt opp og klar for bruk. Du kan nå:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">Sende nye forespørsler</Badge>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">Følge opp tilbud</Badge>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">Administrere profil</Badge>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            Setter opp din konto
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedSteps.includes(step.id) 
                    ? 'bg-green-600 text-white' 
                    : currentStep === step.id 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 ${
                    completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-muted'
                  }`} style={{ width: '60px', marginLeft: '30px' }} />
                )}
              </div>
            ))}
          </div>
          
          {/* Current Step Content */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-semibold">{steps[currentStep - 1]?.title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
            </div>
            
            {renderStepContent()}
          </motion.div>
          
          {/* Action Button */}
          <div className="flex justify-center pt-4">
            {currentStep === steps.length ? (
              <Button onClick={handleComplete} className="w-full">
                Gå til dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNextStep} 
                disabled={isLinking}
                className="w-full"
              >
                {currentStep === 1 && isLinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kobler forespørsler...
                  </>
                ) : (
                  <>
                    Fortsett
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};