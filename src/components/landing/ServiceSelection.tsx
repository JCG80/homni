import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceSelectionProps {
  userType: 'private' | 'business';
  onNextStep: (service: string) => void;
}

export const ServiceSelection = ({ userType, onNextStep }: ServiceSelectionProps) => {
  const [selectedService, setSelectedService] = useState<string>("");
  const navigate = useNavigate();

  const privateServices = [
    { id: 'strom', name: 'Strøm' },
    { id: 'mobil', name: 'Mobil' },
    { id: 'forsikring', name: 'Forsikring' },
    { id: 'bredband', name: 'Bredbånd' },
    { id: 'marina', name: 'Marina' },
  ];

  const businessServices = [
    { id: 'energiavtaler', name: 'Energiavtaler' },
    { id: 'bedriftsforsikring', name: 'Bedriftsforsikring' },
    { id: 'flatestyring', name: 'Flåtestyring' },
    { id: 'kaiplass', name: 'Kaiplass/Bobiladm.' },
  ];

  const services = userType === 'private' ? privateServices : businessServices;

  const handleNext = () => {
    if (selectedService) {
      // Simple example: If selecting "strom" we navigate to the power comparison page
      if (selectedService === 'strom') {
        navigate('/strom');
        return;
      }
      
      // Otherwise follow the multi-step flow
      onNextStep(selectedService);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">Steg 1 av 3 – tar under 1 minutt</div>
        <Progress value={33} className="h-2" />
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Hva ønsker du å sammenligne eller administrere?</h2>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Velg tjeneste" />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleNext}
          disabled={!selectedService}
          className="w-full h-12 mt-4"
        >
          Neste <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
