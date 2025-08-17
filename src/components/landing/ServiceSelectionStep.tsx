import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Smartphone, Shield, Wifi, Factory, Truck, Building } from 'lucide-react';

interface ServiceSelectionStepProps {
  role: 'private' | 'business';
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

const privateServices = [
  { id: 'strom', name: 'Strøm', icon: Zap, description: 'Sammenlign strømpriser' },
  { id: 'mobil', name: 'Mobil', icon: Smartphone, description: 'Mobilabonnement' },
  { id: 'forsikring', name: 'Forsikring', icon: Shield, description: 'Boforsikring og bilforsikring' },
  { id: 'bredband', name: 'Bredbånd', icon: Wifi, description: 'Internett og TV' },
];

const businessServices = [
  { id: 'energi', name: 'Energi', icon: Factory, description: 'Bedriftens energiløsninger' },
  { id: 'forsikring', name: 'Forsikring', icon: Shield, description: 'Bedriftsforsikring' },
  { id: 'flate', name: 'Flåte', icon: Truck, description: 'Flåtehåndtering' },
  { id: 'plassadm', name: 'Plassadministrasjon', icon: Building, description: 'Kontorplass og fasiliteter' },
];

export const ServiceSelectionStep = ({ role, selectedService, onServiceSelect }: ServiceSelectionStepProps) => {
  const services = role === 'business' ? businessServices : privateServices;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Hva kan vi hjelpe deg med?
        </h2>
        <p className="text-muted-foreground">
          Velg tjenesten du ønsker tilbud på
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          
          return (
            <Card
              key={service.id}
              className={`
                p-6 cursor-pointer transition-all hover:shadow-md border-2
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => onServiceSelect(service.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onServiceSelect(service.id);
                }
              }}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  p-3 rounded-lg transition-colors
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};