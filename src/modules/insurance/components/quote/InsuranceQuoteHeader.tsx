
import React from 'react';
import { InsuranceType } from '../../types/insurance-types';
import { InsuranceTypeTag } from '../InsuranceTypeTag';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface InsuranceQuoteHeaderProps {
  selectedType: InsuranceType | undefined;
  currentStep: number;
}

export const InsuranceQuoteHeader: React.FC<InsuranceQuoteHeaderProps> = ({
  selectedType,
  currentStep
}) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl font-semibold text-center">
        {selectedType?.name || "Velg forsikring"}
        {currentStep > 0 && selectedType && (
          <div className="flex justify-center mt-2">
            <InsuranceTypeTag type={selectedType} />
          </div>
        )}
      </CardTitle>
      <p className="text-center text-muted-foreground">
        {currentStep === 0 
          ? "Sammenlign tilbud på forsikring - få uforpliktende tilbud fra flere selskaper." 
          : `Fyll ut informasjon om din ${selectedType?.name.toLowerCase() || "forsikring"}`}
      </p>
    </CardHeader>
  );
};
