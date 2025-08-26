import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileOptimizedStepsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export const MobileOptimizedSteps = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canProceed,
  isSubmitting = false,
  children
}: MobileOptimizedStepsProps) => {
  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 1}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground min-w-[40px] text-right">
            {currentStep}/{totalSteps}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        {children}
      </div>

      {/* Mobile Footer */}
      {currentStep < totalSteps && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="w-full h-12"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Sender...
              </div>
            ) : currentStep === totalSteps - 1 ? (
              'Send forespørsel'
            ) : (
              <>
                Neste
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};