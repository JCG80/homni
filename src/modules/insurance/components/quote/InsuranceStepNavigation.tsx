
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface InsuranceStepNavigationProps {
  currentStep: number;
  steps: Step[];
  handleNext: () => void;
  handleBack: () => void;
  isNextDisabled?: boolean;
}

export const InsuranceStepNavigation: React.FC<InsuranceStepNavigationProps> = ({
  currentStep,
  steps,
  handleNext,
  handleBack,
  isNextDisabled = false
}) => {
  const isLastStep = currentStep === steps.length - 1;
  
  return (
    <div className="flex flex-col mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {step.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {index < steps.length - 1 && (
              <div 
                className={`h-1 w-10 mx-1 ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
        
        <Button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex items-center"
        >
          {isLastStep ? 'Send inn' : 'Neste'}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
