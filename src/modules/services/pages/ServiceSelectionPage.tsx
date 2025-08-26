import React, { useEffect, useState } from 'react';
import { VisitorWizard } from '@/components/landing/VisitorWizard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceLeadCreation } from '@/modules/leads/hooks/useServiceLeadCreation';
import { useAuth } from '@/modules/auth/hooks';
import { Loader2 } from 'lucide-react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { LoginUpgradeCTA } from '@/components/cta/LoginUpgradeCTA';

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
            // Convert pending service to proper Service type
            const serviceData = {
              id: pendingService.id,
              name: pendingService.name,
              icon: 'service',
              category: pendingService.category || 'general',
              description: `Forespørsel om ${pendingService.name}`
            };
            await createLeadFromService(serviceData);
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
      <PageBreadcrumb 
        items={[{ label: 'Velg tjenester' }]} 
        className="mb-6" 
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Velg tjenester</h1>
          <p className="text-gray-600">
            Få tilpassede tilbud ved å fylle ut vårt enkle skjema
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-primary mt-2">
              Du kan starte uten å logge inn - vi sparer dine svar underveis
            </p>
          )}
        </div>
        
        {!isAuthenticated && (
          <div className="mb-8">
            <LoginUpgradeCTA 
              title="Få tilgang til eksklusive fordeler"
              description="Medlemmer får bedre priser, prioritert service og personlige anbefalinger."
            />
          </div>
        )}
        
        {/* Use our enhanced VisitorWizard instead of the basic ServiceSelectionFlow */}
        <VisitorWizard className="bg-background" />
      </div>
    </div>
  );
};