
import React from 'react';
import { Service } from '../types/services';
import { OfferCountBadge } from './OfferCountBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSelectorGridProps {
  services: Service[];
  selectedServices: string[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const ServiceSelectorGrid: React.FC<ServiceSelectorGridProps> = ({
  services,
  selectedServices,
  onSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, index) => (
          <div key={index} className="h-28 rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center">
            <Skeleton className="h-10 w-10 rounded-full mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {services.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        
        return (
          <div
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`
              h-28 rounded-lg border cursor-pointer p-4
              flex flex-col items-center justify-center gap-2
              transition-all duration-200 hover:border-primary/50
              ${isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:shadow-sm'
              }
            `}
          >
            <div className="text-3xl">{service.icon}</div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">{service.name}</span>
              {service.offerCount > 0 && (
                <OfferCountBadge count={service.offerCount} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
