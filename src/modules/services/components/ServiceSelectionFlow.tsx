
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Service } from '../types/services';
import { ServiceSelectorGrid } from './ServiceSelectorGrid';
import { StepProgressBar } from './StepProgressBar';
import { StepNavigationButtons } from './StepNavigationButtons';

interface ServiceSelectionFlowProps {
  onComplete: () => void;
  onCreateLead: (service: Service) => void;
  isCreating?: boolean;
}

export const ServiceSelectionFlow: React.FC<ServiceSelectionFlowProps> = ({ 
  onComplete, 
  onCreateLead,
  isCreating = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setError(null);
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      setError('Vennligst velg en tjeneste for å fortsette');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSubmit = () => {
    if (selectedService) {
      onCreateLead(selectedService);
    } else {
      setError('Vennligst velg en tjeneste først');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <StepProgressBar currentStep={currentStep} totalSteps={3} />
      
      <div className="my-8">
        {currentStep === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Velg tjeneste</h2>
            <ServiceSelectorGrid onSelect={handleServiceSelect} selectedService={selectedService} />
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Angi detaljer</h2>
            <div className="space-y-4">
              <p>Vennligst angi flere detaljer om din forespørsel om {selectedService?.name}:</p>
              {/* Here you can add more input fields for details */}
              <div className="p-4 bg-blue-50 rounded-md text-blue-700">
                <p>Dette er en demoversjon - ingen ytterligere detaljer er påkrevd.</p>
              </div>
            </div>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Bekreft og send</h2>
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium text-lg mb-2">Sammendrag</h3>
              <p><span className="font-medium">Valgt tjeneste:</span> {selectedService?.name}</p>
              <p className="mt-2 text-gray-600">Ved å sende inn denne forespørselen, vil våre partnere ta kontakt med deg for å gi deg et tilbud.</p>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
                  Sender forespørsel...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> 
                  Send forespørsel
                </>
              )}
            </Button>
          </>
        )}
      </div>
      
      <StepNavigationButtons 
        currentStep={currentStep} 
        totalSteps={3}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onComplete={onComplete}
        disableNext={currentStep === 1 && !selectedService}
        isLoading={isCreating}
      />
    </div>
  );
};
