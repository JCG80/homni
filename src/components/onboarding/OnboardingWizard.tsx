
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { StepIndicator } from './StepIndicator';
import { SignupStep } from './steps/SignupStep';
import { ProfileStep } from './steps/ProfileStep';
import { CompletionStep } from './steps/CompletionStep';
import { useAuth } from '@/modules/auth/hooks';

export type UserType = 'member' | 'company';

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType>('member');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phoneNumber: '',
  });
  
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const totalSteps = 3;
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };
  
  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleComplete = async () => {
    try {
      // After profile is complete, refresh auth state to get updated role
      await refreshProfile();
      // Navigate to the appropriate dashboard based on role
      navigate(`/dashboard/${userType}`);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card className="p-6 shadow-lg">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        {currentStep === 1 && (
          <SignupStep 
            formData={formData}
            onFormChange={handleFormChange}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && (
          <ProfileStep 
            formData={formData}
            userType={userType}
            onFormChange={handleFormChange}
            onUserTypeChange={handleUserTypeChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <CompletionStep 
            userType={userType}
            formData={formData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}
      </Card>
    </div>
  );
};
