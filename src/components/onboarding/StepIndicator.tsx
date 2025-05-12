
import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isActive 
                    ? 'bg-primary/20 text-primary border-2 border-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              <span 
                className={`text-xs mt-2 ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {stepNumber === 1 ? 'Sign Up' : stepNumber === 2 ? 'Profile' : 'Complete'}
              </span>
            </div>
            
            {stepNumber < totalSteps && (
              <div className={`h-[2px] w-16 mx-2 ${stepNumber < currentStep ? 'bg-primary' : 'bg-muted'}`}>
                {stepNumber === currentStep - 1 && (
                  <ArrowRight className="h-4 w-4 text-primary animate-pulse translate-y-[-8px] translate-x-[28px]" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
