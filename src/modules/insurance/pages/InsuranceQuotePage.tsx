
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';
import { useInsuranceQuoteForm } from '../hooks/useInsuranceQuoteForm';
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';
import { InsuranceQuoteFormNavigation } from '../components/InsuranceQuoteFormNavigation';
import { InsuranceSelectionStep } from '../components/steps/InsuranceSelectionStep';
import { DetailsStep } from '../components/steps/DetailsStep';
import { GeneralStep } from '../components/steps/GeneralStep';
import { ContactStep } from '../components/steps/ContactStep';

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

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <InsuranceQuoteFormNavigation 
        onNext={handleNext}
        onPrev={handleBack}
        canGoNext={true}
        canGoPrev={currentStep > 0}
        isLastStep={currentStep === STEPS.length - 1}
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepLabels={STEPS}
      />

      {/* Current step content */}
      <Card className="mb-6">
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
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};
