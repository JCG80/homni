
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface StepNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  skipLabel?: string;
  isNextDisabled?: boolean;
  showToast?: boolean;
  toastMessage?: string;
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
  showToast = false,
  toastMessage = "Steg fullført"
}) => {
  const isLastStep = currentStep === totalSteps;
  
  const handleNext = () => {
    if (showToast) {
      toast.success(toastMessage);
    }
    onNext();
  };
  
  return (
    <div className="flex justify-between mt-8 gap-4">
      {currentStep > 1 && onBack && (
        <Button 
          variant="outline"
          onClick={onBack}
          className="flex items-center"
          size="lg"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
      )}
      
      <div className="flex gap-3 ml-auto">
        {onSkip && (
          <Button 
            variant="ghost"
            onClick={onSkip}
            size="lg"
          >
            {skipLabel || "Hopp over"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex items-center"
          size="lg"
        >
          {nextLabel || (isLastStep ? "Fullfør" : "Neste")}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
