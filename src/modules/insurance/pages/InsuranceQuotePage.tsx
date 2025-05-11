
import React from 'react';
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';
import { useInsuranceQuoteForm } from '../hooks/useInsuranceQuoteForm';
import { InsuranceQuoteContainer } from '../components/quote/InsuranceQuoteContainer';
import { InsuranceStepNavigation } from '../components/quote/InsuranceStepNavigation';
import { PageLayout } from '@/components/layout/PageLayout';

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
    <PageLayout 
      title="Få forsikringstilbud"
      description="Sammenlign og få tilbud på forsikring fra flere selskaper samtidig"
    >
      <div className="max-w-3xl mx-auto">
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
    </PageLayout>
  );
};
