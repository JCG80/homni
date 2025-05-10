
import React from 'react';
import { InsuranceQuoteFormNavigation } from '../InsuranceQuoteFormNavigation';

interface Step {
  id: string;
  label: string;
}

interface InsuranceStepNavigationProps {
  currentStep: number;
  steps: Step[];
  handleNext: () => void;
  handleBack: () => void;
}

export const InsuranceStepNavigation: React.FC<InsuranceStepNavigationProps> = ({
  currentStep,
  steps,
  handleNext,
  handleBack
}) => {
  return (
    <InsuranceQuoteFormNavigation 
      onNext={handleNext}
      onPrev={handleBack}
      canGoNext={true}
      canGoPrev={currentStep > 0}
      isLastStep={currentStep === steps.length - 1}
      currentStep={currentStep}
      totalSteps={steps.length}
      stepLabels={steps}
    />
  );
};
