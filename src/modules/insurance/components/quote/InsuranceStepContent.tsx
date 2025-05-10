
import React from 'react';
import { InsuranceSelectionStep } from '../steps/InsuranceSelectionStep';
import { DetailsStep } from '../steps/DetailsStep';
import { GeneralStep } from '../steps/GeneralStep';
import { ContactStep } from '../steps/ContactStep';
import { InsuranceType } from '../../types/insurance-types';

interface InsuranceStepContentProps {
  currentStepId: string;
  formData: any;
  updateFormData: (field: string, value: string | boolean) => void;
  selectedInsuranceType: string;
  setSelectedInsuranceType: (type: string) => void;
  insuranceTypes: InsuranceType[];
  selectedType: InsuranceType | undefined;
}

export const InsuranceStepContent: React.FC<InsuranceStepContentProps> = ({
  currentStepId,
  formData,
  updateFormData,
  selectedInsuranceType,
  setSelectedInsuranceType,
  insuranceTypes,
  selectedType
}) => {
  switch (currentStepId) {
    case 'insurance':
      return <InsuranceSelectionStep 
        selectedType={selectedInsuranceType}
        onSelectType={setSelectedInsuranceType}
        insuranceTypes={insuranceTypes}
      />;
    case 'details':
      return <DetailsStep 
        formData={formData} 
        updateFormData={updateFormData}
        selectedType={selectedType}
      />;
    case 'general':
      return <GeneralStep 
        formData={formData} 
        updateFormData={updateFormData}
      />;
    case 'contact':
      return <ContactStep 
        formData={formData} 
        updateFormData={updateFormData}
      />;
    default:
      return null;
  }
};
