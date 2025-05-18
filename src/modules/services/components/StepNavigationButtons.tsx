
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export interface StepNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevStep?: () => void;
  onComplete: () => void;
  disableNext?: boolean;
  isLoading?: boolean;
}

export const StepNavigationButtons: React.FC<StepNavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevStep,
  onComplete,
  disableNext = false,
  isLoading = false
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between mt-6">
      {!isFirstStep ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevStep}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake
        </Button>
      ) : (
        <div></div> // Empty div to maintain spacing
      )}

      {!isLastStep ? (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={disableNext || isLoading}
        >
          Neste <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onComplete}
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Laster...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Fullfør
            </>
          )}
        </Button>
      )}
    </div>
  );
};
