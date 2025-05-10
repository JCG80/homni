import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Service, ServicePreference } from '../types/services';
import { ServiceSelectorGrid } from './ServiceSelectorGrid';
import { StepProgressBar } from './StepProgressBar';
import { StepNavigationButtons } from './StepNavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { useServicePreferences } from '../hooks/useServicePreferences';

// Mock services data - to be replaced with actual API call
const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Strøm', icon: '⚡', offerCount: 4, detailsRequired: true },
  { id: '2', name: 'Mobil', icon: '📱', offerCount: 8 },
  { id: '3', name: 'Bredbånd', icon: '🌐', offerCount: 5, detailsRequired: true },
  { id: '4', name: 'Forsikring', icon: '🛡️', offerCount: 7, detailsRequired: true },
  { id: '5', name: 'Båt', icon: '⛵', offerCount: 2 },
  { id: '6', name: 'Bank', icon: '🏦', offerCount: 3 },
  { id: '7', name: 'Bil', icon: '🚗', offerCount: 6 },
  { id: '8', name: 'Bolig', icon: '🏠', offerCount: 4 }
];

interface ServiceSelectionFlowProps {
  onComplete?: (services: ServicePreference[]) => void;
}

export const ServiceSelectionFlow: React.FC<ServiceSelectionFlowProps> = ({ 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const { isAuthenticated, user } = useAuth();
  const { savePreferences, isLoading } = useServicePreferences();
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const handleNext = async () => {
    // This is just a demo flow - in a real app, you'd have more steps
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - save preferences or create lead
      if (selectedServiceIds.length === 0) {
        toast.error("Vennligst velg minst én tjeneste");
        return;
      }
      
      // Create ServicePreference objects from selected IDs
      const servicePreferences: ServicePreference[] = selectedServiceIds.map(id => ({
        serviceId: id,
        selected: true
      }));
      
      if (isAuthenticated && user) {
        try {
          await savePreferences(servicePreferences);
          toast.success("Preferanser lagret!");
        } catch (error) {
          toast.error("Kunne ikke lagre preferanser");
          console.error(error);
        }
      } else {
        // For non-authenticated users, we would create a lead here
        // or redirect to a contact form
        toast.success("Takk for din interesse!");
      }
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete(servicePreferences);
      }
    }
  };
  
  const handleSkip = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Skip the whole flow
      if (onComplete) {
        onComplete([]);
      }
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Velg tjenester du er interessert i</h2>
            <ServiceSelectorGrid 
              services={MOCK_SERVICES}
              selectedServices={selectedServiceIds}
              onSelect={handleServiceSelect}
            />
          </>
        );
      case 2:
        // This would be the details step
        // For now, keep it simple
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Flere detaljer</h2>
            <p className="text-gray-600 mb-4">
              Her kan du legge til flere detaljer for dine valgte tjenester.
            </p>
            <ul className="list-disc pl-6 mb-4">
              {selectedServiceIds.map(id => {
                const service = MOCK_SERVICES.find(s => s.id === id);
                return service ? (
                  <li key={id} className="mb-2">{service.name}</li>
                ) : null;
              })}
            </ul>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">
              {isAuthenticated 
                ? "Lagre dine preferanser" 
                : "Kontaktinformasjon"}
            </h2>
            <p className="text-gray-600 mb-4">
              {isAuthenticated 
                ? "Klikk på Fullfør for å lagre dine preferanser." 
                : "Fyll inn din kontaktinformasjon for å få relevante tilbud."}
            </p>
            {/* In a real app, this would include a contact form for non-authenticated users */}
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <StepProgressBar currentStep={currentStep} totalSteps={3} />
        
        {renderCurrentStep()}
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Tilgjengelig kun for valgte leverandører</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Sikker og kryptert behandling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Tar kun 3 minutter</span>
            </div>
          </div>
        </div>
        
        <StepNavigationButtons
          currentStep={currentStep}
          totalSteps={3}
          onNext={handleNext}
          onSkip={handleSkip}
          onBack={currentStep > 1 ? handleBack : undefined}
          isNextDisabled={isLoading}
        />
      </CardContent>
    </Card>
  );
};
