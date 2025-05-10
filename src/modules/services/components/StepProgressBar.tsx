
import React from 'react';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1"
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1
                ${isActive ? 'bg-primary text-white' : 
                  isCompleted ? 'bg-green-100 text-green-700 border border-green-200' : 
                  'bg-gray-100 text-gray-500'}
              `}>
                {stepNumber}
              </div>
              <span className={`
                text-xs font-medium hidden md:block
                ${isActive ? 'text-primary' : 
                  isCompleted ? 'text-green-700' : 'text-gray-500'}
              `}>
                {stepNumber === 1 ? 'Velg' : 
                 stepNumber === 2 ? 'Detaljer' : 'Kontakt'}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all" 
            style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
          />
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-500 mt-2">
        Steg {currentStep} av {totalSteps} – tar kun 1-2 minutter
      </p>
    </div>
  );
};
