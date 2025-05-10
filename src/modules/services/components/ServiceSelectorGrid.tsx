
import React from 'react';
import { Check } from 'lucide-react';
import { Service } from '../types/services';
import { OfferCountBadge } from './OfferCountBadge';

interface ServiceSelectorGridProps {
  services: Service[];
  selectedServices: string[];
  onSelect: (serviceId: string) => void;
}

export const ServiceSelectorGrid: React.FC<ServiceSelectorGridProps> = ({
  services,
  selectedServices,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {services.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        
        return (
          <div
            key={service.id}
            className={`
              relative p-4 rounded-lg border cursor-pointer transition-all
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onClick={() => onSelect(service.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-14 h-14 flex items-center justify-center rounded-full mb-3
                ${isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}
              `}>
                {/* Replace with dynamic icon based on service.icon */}
                <span className="text-2xl">{service.icon}</span>
              </div>
              
              <h3 className="font-medium text-lg">{service.name}</h3>
              
              {isSelected && (
                <div className="absolute top-2 right-2 text-primary">
                  <Check className="h-5 w-5" />
                </div>
              )}
              
              <OfferCountBadge count={service.offerCount} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
