
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
        <SelectTrigger 
          className="w-full h-14 rounded-xl bg-white/95 text-gray-800 text-lg font-medium border border-gray-200/60 shadow-sm hover:shadow-md transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/20"
        >
          <SelectValue placeholder="Hva trenger du hjelp med?" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl border-gray-200 shadow-lg max-h-80 overflow-auto">
          {services.map(service => (
            <SelectItem 
              key={service.id} 
              value={service.id}
              className="hover:bg-gray-50 focus:bg-gray-50 py-3 text-base"
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
