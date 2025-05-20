
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ServiceSelectorProps {
  userType: 'private' | 'business';
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

export const ServiceSelector = ({ 
  userType, 
  selectedService, 
  onServiceSelect
}: ServiceSelectorProps) => {
  
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
    { id: 'transport', name: 'Transport' },
  ];

  const services = userType === 'private' ? privateServices : businessServices;

  return (
    <div>
      <Select 
        value={selectedService} 
        onValueChange={onServiceSelect}
      >
        <SelectTrigger className="w-full h-14 bg-white/95 text-gray-800 text-lg border border-gray-200 shadow-sm hover:shadow focus:border-primary">
          <SelectValue placeholder="Hva trenger du hjelp med?" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-md">
          {services.map(service => (
            <SelectItem 
              key={service.id} 
              value={service.id}
              className="hover:bg-gray-50 focus:bg-gray-50 py-2.5"
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
