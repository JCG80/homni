
import { useState } from 'react';

export const useInsuranceQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>("home");
  
  // Form state
  const [formData, setFormData] = useState({
    propertyCount: "1",
    address: "",
    postalCode: "",
    buildYear: "",
    squareMeters: "",
    coverage: "",
    hasAlarm: false,
    hasDetachedBuildings: false,
    previousClaims: "0",
    hasExistingInsurance: false,
    hasPaymentRemarks: false
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Define our steps
  const STEPS = [
    { id: 'insurance', label: 'Velg forsikringer' },
    { id: 'details', label: 'Detaljer' },
    { id: 'general', label: 'Generelt' },
    { id: 'contact', label: 'Kontaktinformasjon' }
  ];

  return {
    currentStep,
    selectedInsuranceType,
    formData,
    STEPS,
    setSelectedInsuranceType,
    updateFormData,
    handleNext,
    handleBack
  };
};
