
import React from 'react';
import { Button } from '@/components/ui/button';

interface InsuranceQuoteFormNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;
}

export const InsuranceQuoteFormNavigation: React.FC<InsuranceQuoteFormNavigationProps> = ({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLastStep
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
