
import React, { useEffect, useState } from 'react';
import { ServiceSelectionFlow } from '../components/ServiceSelectionFlow';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceLeadCreation } from '@/modules/leads/hooks/useServiceLeadCreation';
import { Service } from '../types/services';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { createLeadFromService, isCreating, checkPendingServiceRequests } = useServiceLeadCreation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isProcessingPending, setIsProcessingPending] = useState(false);
  
  // Enhanced handling for pending service requests after login
  useEffect(() => {
    const handlePendingRequests = async () => {
      if (isAuthenticated && !isLoading) {
        setIsProcessingPending(true);
        
        try {
          const pendingService = checkPendingServiceRequests();
          
          if (pendingService) {
            toast.info(`Fortsetter forespørsel om ${pendingService.name}`);
            await createLeadFromService(pendingService as Service);
          }
        } catch (error) {
          console.error("Error handling pending service request:", error);
          toast.error("Kunne ikke gjenoppta tidligere forespørsel");
        } finally {
          setIsProcessingPending(false);
        }
      }
    };
    
    handlePendingRequests();
  }, [isAuthenticated, isLoading, checkPendingServiceRequests, createLeadFromService]);
  
  const handleComplete = () => {
    toast.success("Takk for dine valg!");
    navigate('/dashboard');
  };
  
  const handleCreateLead = (service: Service) => {
    createLeadFromService(service);
  };
  
  // Show loading indicator when processing a pending request
  if (isProcessingPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg mb-2">Behandler din forespørsel</p>
          <p className="text-sm text-muted-foreground">Vennligst vent et øyeblikk...</p>
        </div>
      </div>
    );
  }
  
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
          isCreating={isCreating}
        />
      </div>
    </div>
  );
};
