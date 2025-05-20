
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
import { motion } from 'framer-motion';

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
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/50">
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-500 mb-2">Steg 1 av 3 – tar under 1 minutt</div>
          <Progress value={33} className="h-2 bg-gray-100" />
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Hva ønsker du å sammenligne eller administrere?</h2>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full h-12 rounded-lg bg-gray-50 border-gray-200 hover:border-primary/30 transition-all">
                <SelectValue placeholder="Velg tjeneste" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-lg border-gray-200 shadow-md">
                {services.map(service => (
                  <SelectItem 
                    key={service.id} 
                    value={service.id}
                    className="hover:bg-primary-50 focus:bg-primary-50 py-2.5 cursor-pointer"
                  >
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!selectedService}
            className="w-full h-12 mt-4 rounded-lg font-medium transition-all duration-300
              disabled:opacity-70 disabled:cursor-not-allowed
              hover:shadow-md hover:shadow-primary/20"
          >
            Neste <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
