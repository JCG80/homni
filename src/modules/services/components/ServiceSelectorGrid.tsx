
import React from 'react';
import { Service } from '../types/services';
import { Button } from '@/components/ui/button';
import { Zap, Shield, Phone, Link } from 'lucide-react';

interface ServiceSelectorGridProps {
  onSelect: (service: Service) => void;
  selectedService: Service | null;
}

export const ServiceSelectorGrid: React.FC<ServiceSelectorGridProps> = ({
  onSelect,
  selectedService,
}) => {
  // Sample services
  const services: Service[] = [
    { id: "strom", name: "Strøm", icon: "Zap", category: "utilities" },
    { id: "forsikring", name: "Forsikring", icon: "Shield", category: "insurance" },
    { id: "mobil", name: "Mobilabonnement", icon: "Phone", category: "telecom" },
    { id: "bredband", name: "Bredbånd", icon: "Link", category: "telecom" },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="h-6 w-6" />;
      case 'Shield':
        return <Shield className="h-6 w-6" />;
      case 'Phone':
        return <Phone className="h-6 w-6" />;
      case 'Link':
        return <Link className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {services.map((service) => (
        <Button
          key={service.id}
          variant={selectedService?.id === service.id ? "default" : "outline"}
          className={`h-24 flex flex-col items-center justify-center ${
            selectedService?.id === service.id ? "bg-primary text-primary-foreground" : ""
          }`}
          onClick={() => onSelect(service)}
        >
          <div className="mb-2">{getIconComponent(service.icon)}</div>
          <span>{service.name}</span>
        </Button>
      ))}
    </div>
  );
};
