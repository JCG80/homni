
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InsuranceQuoteFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  stepLabels: { id: string; label: string }[];
}

export const InsuranceQuoteFormNavigation = ({ 
  currentStep,
  totalSteps,
  onNext,
  onBack,
  stepLabels
}: InsuranceQuoteFormNavigationProps) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {stepLabels.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm
                  ${index === currentStep 
                    ? 'bg-primary text-white' 
                    : index < currentStep 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-500'}
                `}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.label}</span>
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-center text-xs text-muted-foreground mt-2">
          Steg {currentStep + 1} av {totalSteps} – tar under 1 minutt
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Tilbake
          </Button>
        ) : (
          <div /> {/* Empty div to maintain spacing */}
        )}
        <Button 
          onClick={onNext}
          className="flex items-center"
        >
          {currentStep < totalSteps - 1 ? (
            <>Neste <ChevronRight className="ml-1 h-4 w-4" /></>
          ) : (
            'Få tilbud'
          )}
        </Button>
      </div>
    </>
  );
};
