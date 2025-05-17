
import { useState } from 'react';
import { Service } from '@/modules/services/types/services';
import { useCreateLead } from './useLeads';
import { toast } from 'sonner';

export const useServiceLeadCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: createLead } = useCreateLead();
  
  const createLeadFromService = async (service: Service) => {
    setIsCreating(true);
    
    try {
      // Create a lead title and description based on the service
      const leadData = {
        title: `Forespørsel om ${service.name}`,
        description: `Jeg er interessert i å få tilbud på ${service.name}. Vennligst kontakt meg for mer informasjon.`,
        category: service.name.toLowerCase(),
      };
      
      // Create the lead
      createLead(leadData, {
        onSuccess: () => {
          toast.success(`Forespørsel om ${service.name} er opprettet`);
        },
        onError: (error) => {
          console.error("Failed to create lead:", error);
          toast.error(`Kunne ikke opprette forespørsel om ${service.name}`);
        },
        onSettled: () => {
          setIsCreating(false);
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error creating lead from service:", error);
      setIsCreating(false);
      return false;
    }
  };
  
  return {
    createLeadFromService,
    isCreating
  };
};
