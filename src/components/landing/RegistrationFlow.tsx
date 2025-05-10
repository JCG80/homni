
import React, { useState } from 'react';
import { ServiceSelection } from './ServiceSelection';
import { LocationStep } from './LocationStep';
import { RegistrationStep } from './RegistrationStep';

interface RegistrationFlowProps {
  userType: 'private' | 'business';
}

export const RegistrationFlow = ({ userType }: RegistrationFlowProps) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [locationData, setLocationData] = useState<{
    postalCode: string;
    propertyType: string;
  }>({
    postalCode: '',
    propertyType: '',
  });

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleLocationSubmit = (data: { postalCode: string; propertyType: string }) => {
    setLocationData(data);
    setStep(3);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      {step === 1 && (
        <ServiceSelection 
          userType={userType} 
          onNextStep={handleServiceSelect} 
        />
      )}

      {step === 2 && (
        <LocationStep 
          userType={userType}
          selectedService={selectedService}
          onPrevStep={() => setStep(1)} 
          onNextStep={handleLocationSubmit} 
        />
      )}

      {step === 3 && (
        <RegistrationStep 
          userType={userType}
          selectedService={selectedService}
          locationData={locationData}
          onPrevStep={() => setStep(2)} 
        />
      )}
    </div>
  );
};
