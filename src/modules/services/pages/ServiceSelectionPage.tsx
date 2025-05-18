
import React, { useEffect, useState } from 'react';
import { ServiceSelectionFlow } from '../components/ServiceSelectionFlow';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceLeadCreation } from '@/modules/leads/hooks/useServiceLeadCreation';
import { Service } from '../types/services';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { createLeadFromService, isCreating, checkPendingServiceRequests } = useServiceLeadCreation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isProcessingPending, setIsProcessingPending] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
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
  
  const handleComplete = async () => {
    if (selectedService) {
      if (!isAuthenticated) {
        // Store selection and redirect to login
        toast.info("Du må logge inn for å fullføre forespørselen");
        navigate('/login', { state: { returnUrl: '/select-services' } });
        return;
      }
      
      toast.success(`Takk for din forespørsel om ${selectedService.name}!`);
      
      // If not already creating, create lead
      if (!isCreating) {
        try {
          await createLeadFromService(selectedService);
        } catch (error) {
          console.error("Error creating lead:", error);
          // Error is handled within createLeadFromService
        }
      }
      
      navigate('/leads');
    } else {
      toast.info("Vennligst velg en tjeneste først");
    }
  };
  
  const handleCreateLead = async (service: Service) => {
    try {
      if (isAuthenticated) {
        await createLeadFromService(service);
      } else {
        setSelectedService(service);
        // Don't create lead immediately if not authenticated
      }
    } catch (error) {
      console.error('Error in handleCreateLead:', error);
    }
  };
  
  // Add the onSelectService handler
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    console.log('Service selected:', service);
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
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Tilbake til forsiden
        </Button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Velg tjenester</h1>
          <p className="text-gray-600">
            Velg tjenester du er interessert i for å få tilpassede tilbud
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-primary mt-2">
              Du kan velge tjenester nå, men må logge inn for å fullføre forespørselen
            </p>
          )}
        </div>
        
        <ServiceSelectionFlow 
          onSelectService={handleSelectService}
          onComplete={handleComplete} 
          onCreateLead={handleCreateLead}
          isCreating={isCreating}
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Etter at du har valgt tjenester vil du kunne se dine forespørsler på 
            <Button 
              variant="link" 
              onClick={() => navigate('/leads')}
              className="p-0 mx-1 h-auto"
            >
              Forespørsler
            </Button>
            siden.
          </p>
        </div>
      </div>
    </div>
  );
};
