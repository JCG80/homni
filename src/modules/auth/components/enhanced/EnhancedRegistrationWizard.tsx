import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { RegistrationStep } from './RegistrationStep';
import { useEnhancedRegistration } from '../../hooks/useEnhancedRegistration';
import { cn } from '@/lib/utils';

export interface RegistrationData {
  // Step 1: Basic Info
  userType: 'private' | 'business';
  email: string;
  
  // Step 2: Personal/Business Details
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  
  // Step 3: Security
  password: string;
  confirmPassword?: string;
  
  // Step 4: Preferences (optional)
  marketingConsent?: boolean;
  serviceInterests?: string[];
}

interface EnhancedRegistrationWizardProps {
  userType: 'private' | 'business';
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

const STEPS = [
  { id: 1, title: 'E-post', description: 'Din e-postadresse' },
  { id: 2, title: 'Detaljer', description: 'Personlig informasjon' },
  { id: 3, title: 'Sikkerhet', description: 'Lag et trygt passord' },
  { id: 4, title: 'Ferdig', description: 'Fullfør registreringen' }
];

export const EnhancedRegistrationWizard = ({ 
  userType, 
  onSuccess, 
  redirectTo,
  className 
}: EnhancedRegistrationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    userType,
    email: '',
    password: '',
    marketingConsent: false,
    serviceInterests: []
  });

  const { 
    isSubmitting, 
    error, 
    handleRegistration,
    clearError 
  } = useEnhancedRegistration({
    onSuccess,
    redirectTo
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    clearError();
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    await handleRegistration(registrationData);
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!registrationData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email);
      case 2:
        if (userType === 'business') {
          return !!(registrationData.fullName && registrationData.companyName);
        }
        return !!registrationData.fullName;
      case 3:
        return !!(registrationData.password && registrationData.password.length >= 6);
      default:
        return true;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Steg {currentStep} av {STEPS.length}</span>
          <span>{Math.round(progress)}% fullført</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RegistrationStep
              step={currentStep}
              userType={userType}
              data={registrationData}
              onChange={updateData}
              error={error}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed(currentStep) || isSubmitting}
            className="flex items-center gap-2"
          >
            Neste
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed(currentStep) || isSubmitting}
            className="flex items-center gap-2 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Registrerer...
              </>
            ) : (
              'Fullfør registrering'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};