
import React from 'react';
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';
import { useInsuranceQuoteForm } from '../hooks/useInsuranceQuoteForm';
import { InsuranceQuoteContainer } from '../components/quote/InsuranceQuoteContainer';
import { InsuranceStepNavigation } from '../components/quote/InsuranceStepNavigation';

export const InsuranceQuotePage = () => {
  const { data: insuranceTypes = [] } = useInsuranceQueries.useInsuranceTypes();
  const { 
    currentStep, 
    selectedInsuranceType, 
    formData, 
    STEPS,
    setSelectedInsuranceType, 
    updateFormData, 
    handleNext, 
    handleBack 
  } = useInsuranceQuoteForm();

  // Find the selected insurance type
  const selectedType = insuranceTypes.find(type => type.slug === selectedInsuranceType);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <InsuranceStepNavigation 
        currentStep={currentStep}
        steps={STEPS}
        handleNext={handleNext}
        handleBack={handleBack}
      />

      <InsuranceQuoteContainer
        currentStepId={STEPS[currentStep]?.id}
        formData={formData}
        updateFormData={updateFormData}
        selectedInsuranceType={selectedInsuranceType}
        setSelectedInsuranceType={setSelectedInsuranceType}
        insuranceTypes={insuranceTypes}
        selectedType={selectedType}
        currentStep={currentStep}
      />
    </div>
  );
};
