
import React from 'react';
import { Button } from '@/components/ui/button';

interface InsuranceQuoteFormNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;
  // Add the missing properties from the error
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: Array<{id: string; label: string}>;
}

export const InsuranceQuoteFormNavigation: React.FC<InsuranceQuoteFormNavigationProps> = ({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLastStep,
  // Include the new properties with defaults
  currentStep,
  totalSteps,
  stepLabels
}) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={!canGoPrev}
      >
        Tilbake
      </Button>
      
      <Button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
      >
        {isLastStep ? 'Send inn' : 'Neste'}
      </Button>
    </div>
  );
};
