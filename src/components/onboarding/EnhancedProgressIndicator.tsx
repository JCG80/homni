import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, AlertCircle, Clock, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';

interface EnhancedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  hasErrors?: boolean;
  estimatedTimeRemaining?: number; // in seconds
  hasRestoredProgress?: boolean;
  className?: string;
  showHints?: boolean;
}

export const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  hasErrors = false,
  estimatedTimeRemaining,
  hasRestoredProgress = false,
  className = "",
  showHints = true
}) => {
  const { t } = useI18n();
  
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const isComplete = currentStep === totalSteps;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getStepHint = (step: number): string => {
    const hints = [
      "Velg tjenesten du trenger hjelp med",
      "Fortell oss om din eiendom",
      "Oppgi kontaktinformasjon for tilbud", 
      "Gjennomgå og send forespørsel"
    ];
    return hints[step - 1] || "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with step info and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">
            Steg {currentStep} av {totalSteps}
          </h3>
          
          {hasRestoredProgress && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Gjenopprettet
            </Badge>
          )}
          
          {hasErrors && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Feil
            </Badge>
          )}
        </div>

        {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Ca. {formatTime(estimatedTimeRemaining)} igjen</span>
          </div>
        )}
      </div>

      {/* Visual progress bar */}
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className={`h-2 transition-all duration-300 ${
            hasErrors ? 'progress-error' : isComplete ? 'progress-success' : ''
          }`}
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% fullført</span>
          {isComplete && (
            <span className="text-green-600 font-medium">✓ Komplett</span>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCurrentStep = stepNumber === currentStep;
          const isCompletedStep = stepNumber < currentStep;
          const isFutureStep = stepNumber > currentStep;

          return (
            <motion.div
              key={stepNumber}
              className="flex flex-col items-center space-y-2"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ 
                scale: isCurrentStep ? 1.1 : 1,
                opacity: isFutureStep ? 0.4 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Step circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompletedStep 
                  ? 'bg-green-500 text-white' 
                  : isCurrentStep 
                    ? hasErrors 
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {isCompletedStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : hasErrors && isCurrentStep ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{stepNumber}</span>
                )}
              </div>

              {/* Step label - only show for current and completed steps on mobile */}
              <div className="text-center min-w-0">
                <p className={`
                  text-xs font-medium truncate max-w-20
                  ${isCurrentStep || isCompletedStep 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                  }
                `}>
                  {getStepLabel(stepNumber)}
                </p>
              </div>

              {/* Connection line */}
              {index < totalSteps - 1 && (
                <div className={`
                  absolute top-4 left-1/2 w-full h-0.5 -z-10 transition-all duration-300
                  ${isCompletedStep ? 'bg-green-500' : 'bg-muted'}
                `} style={{ 
                  transform: 'translateX(50%)', 
                  width: `calc(100% / ${totalSteps - 1} - 2rem)`
                }} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current step hint */}
      {showHints && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-muted/50 rounded-lg p-3 flex items-start gap-3"
        >
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">Tips for dette steget:</p>
            <p className="text-xs text-muted-foreground">
              {getStepHint(currentStep)}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const getStepLabel = (step: number): string => {
  const labels = ["Tjeneste", "Eiendom", "Kontakt", "Fullfør"];
  return labels[step - 1] || `Steg ${step}`;
};