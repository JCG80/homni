import React from 'react';
import { PricingPlans } from '@/modules/payment/components/PricingPlans';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PricingStepProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const PricingStep = ({ 
  selectedPlan, 
  onPlanSelect, 
  onNext, 
  onBack,
  isLoading = false 
}: PricingStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your property management needs
        </p>
      </div>
      
      <PricingPlans
        onSelectPlan={onPlanSelect}
        selectedPlan={selectedPlan}
        isLoading={isLoading}
      />
      
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={isLoading || !selectedPlan}
          className="gap-2"
        >
          Continue to Summary
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          )}
        </Button>
      </div>
    </div>
  );
};