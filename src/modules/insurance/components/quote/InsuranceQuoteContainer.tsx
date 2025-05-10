
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { InsuranceQuoteHeader } from './InsuranceQuoteHeader';
import { InsuranceStepContent } from './InsuranceStepContent';
import { InsuranceType } from '../../types/insurance-types';

interface InsuranceQuoteContainerProps {
  currentStepId: string;
  formData: any;
  updateFormData: (field: string, value: string | boolean) => void;
  selectedInsuranceType: string;
  setSelectedInsuranceType: (type: string) => void;
  insuranceTypes: InsuranceType[];
  selectedType: InsuranceType | undefined;
  currentStep: number;
}

export const InsuranceQuoteContainer: React.FC<InsuranceQuoteContainerProps> = ({
  currentStepId,
  formData,
  updateFormData,
  selectedInsuranceType,
  setSelectedInsuranceType,
  insuranceTypes,
  selectedType,
  currentStep
}) => {
  return (
    <Card className="mb-6">
      <InsuranceQuoteHeader
        selectedType={selectedType}
        currentStep={currentStep}
      />
      <CardContent>
        <InsuranceStepContent
          currentStepId={currentStepId}
          formData={formData}
          updateFormData={updateFormData}
          selectedInsuranceType={selectedInsuranceType}
          setSelectedInsuranceType={setSelectedInsuranceType}
          insuranceTypes={insuranceTypes}
          selectedType={selectedType}
        />
      </CardContent>
    </Card>
  );
};
