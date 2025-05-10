
import React from 'react';
import { ServiceSelectionFlow } from '../components/ServiceSelectionFlow';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleComplete = () => {
    toast.success("Takk for dine valg!");
    navigate('/dashboard');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Velg tjenester</h1>
          <p className="text-gray-600">
            Velg tjenester du er interessert i for å få tilpassede tilbud
          </p>
        </div>
        
        <ServiceSelectionFlow onComplete={handleComplete} />
      </div>
    </div>
  );
};
