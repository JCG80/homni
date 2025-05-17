
import React, { useEffect } from 'react';
import { ServiceSelectionFlow } from '../components/ServiceSelectionFlow';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceLeadCreation } from '@/modules/leads/hooks/useServiceLeadCreation';
import { Service } from '../types/services';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { createLeadFromService, isCreating, checkPendingServiceRequests } = useServiceLeadCreation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check for pending service requests after login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const pendingService = checkPendingServiceRequests();
      
      if (pendingService) {
        toast.info(`Fortsetter forespørsel om ${pendingService.name}`);
        createLeadFromService(pendingService as Service);
      }
    }
  }, [isAuthenticated, isLoading]);
  
  const handleComplete = () => {
    toast.success("Takk for dine valg!");
    navigate('/dashboard');
  };
  
  const handleCreateLead = (service: Service) => {
    createLeadFromService(service);
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
        
        <ServiceSelectionFlow 
          onComplete={handleComplete} 
          onCreateLead={handleCreateLead}
        />
      </div>
    </div>
  );
};
