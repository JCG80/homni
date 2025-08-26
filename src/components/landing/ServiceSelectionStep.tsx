import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Hammer, 
  Zap, 
  PiggyBank, 
  Shield, 
  Home, 
  Wrench, 
  Calculator,
  Heart,
  Building,
  Factory
} from 'lucide-react';

interface ServiceSelectionStepProps {
  role: 'private' | 'business';
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

const privateServices = [
  { 
    id: 'handverkere', 
    name: 'Håndverkere', 
    icon: Hammer, 
    description: 'Rørlegger, elektriker, maler, tømrer'
  },
  { 
    id: 'energi', 
    name: 'Energiløsninger', 
    icon: Zap, 
    description: 'Varmepumpe, solceller, isolering'
  },
  { 
    id: 'okonomi', 
    name: 'Boligøkonomi', 
    icon: PiggyBank, 
    description: 'Refinansiering, forsikring, strøm'
  },
  { 
    id: 'tilgjengelighet', 
    name: 'Tilgjengelighet', 
    icon: Heart, 
    description: 'Trapp, rampe, bad tilpasning'
  },
];

const businessServices = [
  { 
    id: 'byggtjenester', 
    name: 'Byggtjenester', 
    icon: Building, 
    description: 'Renovering, vedlikehold, utbygging'
  },
  { 
    id: 'energi', 
    name: 'Energioptimalisering', 
    icon: Factory, 
    description: 'Bedriftens energiløsninger og besparelser'
  },
  { 
    id: 'vedlikehold', 
    name: 'Vedlikehold', 
    icon: Wrench, 
    description: 'Fasilitetsforvaltning og service'
  },
  { 
    id: 'okonomi', 
    name: 'Eiendomsøkonomi', 
    icon: Calculator, 
    description: 'Finansiering og kostnadsoptimalisering'
  },
];

export const ServiceSelectionStep = ({ role, selectedService, onServiceSelect }: ServiceSelectionStepProps) => {
  const services = role === 'business' ? businessServices : privateServices;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          {role === 'business' ? 'Bedriftens eiendomsbehov' : 'Forbedre boligen din'}
        </h2>
        <p className="text-lg text-muted-foreground">
          {role === 'business' 
            ? 'Få tilbud på tjenester som reduserer kostnader og forbedrer arbeidsplassen'
            : 'Spar penger og bo tryggere med de riktige løsningene'
          }
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