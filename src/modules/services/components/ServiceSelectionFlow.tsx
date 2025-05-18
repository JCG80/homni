
import React, { useState, useEffect } from 'react';
import { Service } from '../types/services';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceSelectionFlowProps {
  onSelectService: (service: Service) => void;
  onComplete?: () => void;
  onCreateLead?: (service: Service) => void;
  isCreating?: boolean;
}

export const ServiceSelectionFlow: React.FC<ServiceSelectionFlowProps> = ({
  onSelectService,
  onComplete,
  onCreateLead,
  isCreating = false,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([
    {
      id: 'service-1',
      name: 'Forsikring',
      icon: 'shield',
      category: 'forsikring',
      description: 'Få tilbud på ulike typer forsikringer for deg og familien din',
    },
    {
      id: 'service-2',
      name: 'Eiendom',
      icon: 'building',
      category: 'eiendom',
      description: 'Få hjelp med boligkjøp, -salg og -finansiering',
    },
    {
      id: 'service-3',
      name: 'Finans',
      icon: 'currency',
      category: 'finans',
      description: 'Få rådgivning om lån, sparing og pensjon',
    }
  ]);

  useEffect(() => {
    // We could fetch services from an API in a real implementation
    console.log('ServiceSelectionFlow mounted');
    return () => console.log('ServiceSelectionFlow unmounted');
  }, []);

  const handleServiceSelection = (service: Service) => {
    setSelectedServiceId(service.id);
    onSelectService(service);
    
    if (onCreateLead) {
      try {
        onCreateLead(service);
        toast.success(`Forespørsel om ${service.name} er sendt`);
      } catch (error) {
        console.error('Error creating lead:', error);
        toast.error('Kunne ikke opprette forespørsel');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div 
            key={service.id}
            className={`p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              selectedServiceId === service.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleServiceSelection(service)}
          >
            <h3 className="text-lg font-medium">{service.name}</h3>
            <p className="text-sm text-gray-500 mt-2">{service.description}</p>
          </div>
        ))}
      </div>
      
      {onComplete && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={onComplete}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Behandler...
              </>
            ) : (
              'Fullfør'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
