
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { StepIndicator } from './StepIndicator';
import { SignupStep } from './steps/SignupStep';
import { ProfileStep } from './steps/ProfileStep';
import { PricingStep } from './steps/PricingStep';
import { CompletionStep } from './steps/CompletionStep';
import { useAuth } from '@/modules/auth/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export type UserType = 'user' | 'company';

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType>('user');
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phoneNumber: '',
  });
  
  const navigate = useNavigate();
  const { refreshProfile, isAuthenticated } = useAuth();

  const totalSteps = 4;
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast({
        title: "Already logged in",
        description: "You are already logged in. Redirecting to dashboard...",
        variant: "default"
      });
      
      // Give toast time to show before redirecting
      const timeout = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, navigate]);
  
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
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleComplete = async () => {
    try {
      toast({
        title: "Setting up your profile",
        description: "Please wait while we complete your registration...",
        variant: "default"
      });
      
      // After profile is complete, refresh auth state to get updated role
      await refreshProfile();
      
      toast({
        title: "Registration complete!",
        description: "Your account is ready. Redirecting to dashboard...",
        variant: "default"
      });
      
      // Navigate to the appropriate dashboard based on role
      setTimeout(() => {
        if (userType === 'user') {
          navigate('/dashboard/user');
        } else if (userType === 'company') {
          navigate('/dashboard/company');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error) {
      logger.error('Error completing onboarding:', {}, error);
      toast({
        title: "Registration error",
        description: "There was an error completing your registration. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };
  
  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 shadow-lg">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
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
                <PricingStep
                  selectedPlan={selectedPlan}
                  onPlanSelect={handlePlanSelect}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              
              {currentStep === 4 && (
                <CompletionStep 
                  userType={userType}
                  formData={formData}
                  selectedPlan={selectedPlan}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};
