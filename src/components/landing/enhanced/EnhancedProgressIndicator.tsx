import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  hasErrors?: boolean;
  estimatedTimeRemaining?: number; // in seconds
  hasRestoredProgress?: boolean;
}

const stepLabels = [
  'Velg tjeneste',
  'Dine behov', 
  'Kontaktinfo',
  'Fullført'
];

export const EnhancedProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  hasErrors = false,
  estimatedTimeRemaining,
  hasRestoredProgress = false
}: EnhancedProgressIndicatorProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
      {/* Restoration Notice */}
      {hasRestoredProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Clock className="w-4 h-4" />
            <span>Vi har gjenopprettet hvor du var! Du kan fortsette der du slapp.</span>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const hasError = hasErrors && isCurrent;
          
          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-md' 
                    : isCurrent && hasError
                    ? 'bg-red-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : hasError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`
                  text-xs mt-2 text-center max-w-[80px] leading-tight
                  ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}
                `}>
                  {stepLabels[index] || `Steg ${step}`}
                </span>
              </div>
              
              {/* Connection Line */}
              {step < totalSteps && (
                <div className={`
                  flex-1 h-1 mx-2 transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercentage} className="h-3 mb-4" />
      
      {/* Status and Time Information */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Steg {currentStep} av {totalSteps}
          </span>
          {hasErrors && (
            <Badge variant="destructive" className="text-xs">
              Fyll ut påkrevde felt
            </Badge>
          )}
        </div>
        
        {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>~{Math.ceil(estimatedTimeRemaining / 60)} min igjen</span>
          </div>
        )}
      </div>
    </div>
  );
};