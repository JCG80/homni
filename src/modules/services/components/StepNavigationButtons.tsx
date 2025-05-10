
import React from 'react';
import { Button } from '@/components/ui/button';

interface StepNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  skipLabel?: string;
  isNextDisabled?: boolean;
}

export const StepNavigationButtons: React.FC<StepNavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onBack,
  nextLabel,
  skipLabel,
  isNextDisabled = false,
}) => {
  const isLastStep = currentStep === totalSteps;
  
  return (
    <div className="flex justify-between mt-8 gap-4">
      {currentStep > 1 && onBack && (
        <Button 
          variant="outline"
          onClick={onBack}
        >
          Tilbake
        </Button>
      )}
      
      <div className="flex gap-3 ml-auto">
        {onSkip && (
          <Button 
            variant="ghost"
            onClick={onSkip}
          >
            {skipLabel || "Hopp over"}
          </Button>
        )}
        
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {nextLabel || (isLastStep ? "Fullfør" : "Neste")}
        </Button>
      </div>
    </div>
  );
};
