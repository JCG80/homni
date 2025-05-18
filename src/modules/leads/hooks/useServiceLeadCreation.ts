
import { useState, useCallback } from 'react';
import { Service } from '@/modules/services/types/services';
import { useCreateLead } from './useLeads';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const useServiceLeadCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { createLead, isLoading } = useCreateLead();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const createLeadFromService = async (service: Service) => {
    setIsCreating(true);
    
    try {
      // Enhanced check for user authentication before creating lead
      if (!isAuthenticated || !user) {
        console.log("User not authenticated, redirecting to login");
        toast.error("Du må logge inn for å opprette en forespørsel");
        
        // Store selected service in session storage to restore after login
        sessionStorage.setItem('pendingServiceRequest', JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          serviceCategory: service.category,
          timestamp: new Date().toISOString()
        }));
        
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent('/select-services');
        navigate(`/login?returnUrl=${returnUrl}`);
        setIsCreating(false);
        return false;
      }
      
      // Map service category to lead category with improved logic
      const mapServiceCategoryToLeadCategory = (category: string): string => {
        const mappings: Record<string, string> = {
          'forsikring': 'insurance',
          'eiendom': 'property',
          'finans': 'finance'
        };
        
        return mappings[category.toLowerCase()] || category.toLowerCase();
      };
      
      // Create a lead title and description based on the service
      const leadData = {
        title: `Forespørsel om ${service.name}`,
        description: `Jeg er interessert i å få tilbud på ${service.name}. Vennligst kontakt meg for mer informasjon.`,
        category: mapServiceCategoryToLeadCategory(service.category),
        lead_type: service.category,
        metadata: {
          serviceId: service.id,
          serviceName: service.name
        }
      };
      
      // Create the lead with enhanced error handling
      createLead(leadData, {
        onSuccess: () => {
          // Clear any pending request after successful creation
          sessionStorage.removeItem('pendingServiceRequest');
          toast.success(`Forespørsel om ${service.name} er opprettet`);
          
          // Navigate to dashboard after successful lead creation
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        },
        onError: (error: any) => {
          console.error("Failed to create lead:", error);
          
          // Provide more user-friendly error messages
          if (error.message?.includes('auth') || error.status === 401) {
            toast.error("Autentiseringsfeil: Vennligst logg inn på nytt");
            // Redirect to login if authentication error
            setTimeout(() => {
              navigate('/login?returnUrl=/select-services');
            }, 500);
          } else {
            toast.error(`Kunne ikke opprette forespørsel om ${service.name}: ${error.message || 'Ukjent feil'}`);
          }
        },
        onSettled: () => {
          setIsCreating(false);
        }
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating lead from service:", error);
      
      // More detailed error logging and handling
      if (error instanceof Error) {
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        if (error.message.includes('auth') || error.message.includes('Authentication')) {
          toast.error("Autentiseringsfeil: Vennligst logg inn på nytt");
          navigate('/login?returnUrl=/select-services');
        } else {
          toast.error(`En feil oppstod: ${error.message}`);
        }
      } else {
        toast.error("En ukjent feil oppstod ved oppretting av forespørsel");
      }
      
      setIsCreating(false);
      return false;
    }
  };
  
  // Function to check for pending service requests after login
  const checkPendingServiceRequests = useCallback(() => {
    const pendingRequest = sessionStorage.getItem('pendingServiceRequest');
    
    if (pendingRequest) {
      try {
        const parsedRequest = JSON.parse(pendingRequest);
        const { serviceId, serviceName, serviceCategory, timestamp } = parsedRequest;
        
        // Check if request is still valid (not older than 30 minutes)
        const requestTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - requestTime;
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        if (timeDifference < maxAge) {
          // Return the service info to recreate the request
          return { 
            id: serviceId, 
            name: serviceName,
            category: serviceCategory || 'forsikring'
          };
        } else {
          // Clear expired request
          console.log("Pending service request expired, clearing");
          sessionStorage.removeItem('pendingServiceRequest');
          toast.info("Din tidligere forespørsel er utløpt. Vennligst velg tjeneste på nytt.");
        }
      } catch (error) {
        console.error("Error parsing pending service request:", error);
        sessionStorage.removeItem('pendingServiceRequest');
      }
    }
    
    return null;
  }, []);
  
  return {
    createLeadFromService,
    isCreating: isCreating || isLoading,
    checkPendingServiceRequests
  };
};
