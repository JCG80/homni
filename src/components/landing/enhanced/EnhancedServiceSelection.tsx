import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Hammer, 
  Zap, 
  PiggyBank, 
  Shield, 
  Heart,
  Building,
  Factory,
  Wrench,
  Calculator,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { UserRole } from '@/components/landing/VisitorWizard';

interface EnhancedServiceSelectionProps {
  role: UserRole;
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

const privateServices = [
  { 
    id: 'handverkere', 
    name: 'Håndverkere', 
    icon: Hammer, 
    description: 'Rørlegger, elektriker, maler, tømrer',
    avgSavings: '8,000 - 15,000',
    popularity: 'Mest populært',
    timeframe: '1-2 uker',
    details: ['Sammenlign priser', 'Sjekket kvalitet', 'Garanti inkludert']
  },
  { 
    id: 'energi', 
    name: 'Energiløsninger', 
    icon: Zap, 
    description: 'Varmepumpe, solceller, isolering',
    avgSavings: '15,000 - 35,000',
    popularity: 'Høy etterspørsel',
    timeframe: '2-4 uker',
    details: ['Støtte fra Enova', 'ROI 3-7 år', 'Miljøvennlig']
  },
  { 
    id: 'okonomi', 
    name: 'Boligøkonomi', 
    icon: PiggyBank, 
    description: 'Refinansiering, forsikring, strøm',
    avgSavings: '5,000 - 25,000',
    popularity: 'Stigende trend',
    timeframe: '1-3 dager',
    details: ['Lavere rente', 'Bedre vilkår', 'Ingen binding']
  },
  { 
    id: 'tilgjengelighet', 
    name: 'Tilgjengelighet', 
    icon: Heart, 
    description: 'Trapp, rampe, bad tilpasning',
    avgSavings: 'Støtte tilgjengelig',
    popularity: 'Spesialist',
    timeframe: '2-6 uker',
    details: ['NAV støtte', 'Kommunal hjelp', 'Sertifiserte']
  },
];

const businessServices = [
  { 
    id: 'byggtjenester', 
    name: 'Byggtjenester', 
    icon: Building, 
    description: 'Renovering, vedlikehold, utbygging',
    avgSavings: '50,000 - 200,000',
    popularity: 'Høy verdi',
    timeframe: '4-12 uker',
    details: ['Økt eiendomsverdi', 'Prosjektledelse', 'Turnkey løsninger']
  },
  { 
    id: 'energi', 
    name: 'Energioptimalisering', 
    icon: Factory, 
    description: 'Bedriftens energiløsninger og besparelser',
    avgSavings: '75,000 - 300,000',
    popularity: 'ESG fokus',
    timeframe: '6-16 uker',
    details: ['30-60% besparelse', 'Grønne sertifikater', 'Langsiktig ROI']
  },
  { 
    id: 'vedlikehold', 
    name: 'Vedlikehold', 
    icon: Wrench, 
    description: 'Fasilitetsforvaltning og service',
    avgSavings: '25,000 - 100,000',
    popularity: 'Operasjonell',
    timeframe: 'Løpende',
    details: ['Forebyggende', 'Service avtaler', '24/7 support']
  },
  { 
    id: 'okonomi', 
    name: 'Eiendomsøkonomi', 
    icon: Calculator, 
    description: 'Finansiering og kostnadsoptimalisering',
    avgSavings: '100,000 - 500,000',
    popularity: 'Strategisk',
    timeframe: '2-8 uker',
    details: ['Finansiering', 'Skatteoptimal', 'Portefølje analyse']
  },
];

export const EnhancedServiceSelection = ({ role, selectedService, onServiceSelect }: EnhancedServiceSelectionProps) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const services = role === 'business' ? businessServices : privateServices;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          {role === 'business' ? 'Optimaliser bedriftens eiendom' : 'Forbedre boligen din'}
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          {role === 'business' 
            ? 'Få tilbud på tjenester som reduserer kostnader og øker verdien'
            : 'Spar penger og bo tryggere med de riktige løsningene'
          }
        </p>
        
        {/* Quick Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>2,341+ fornøyde kunder</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Gjennomsnitt 18% besparelse</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Tilbud innen 24 timer</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          const isExpanded = showDetails === service.id;
          
          return (
            <Card
              key={service.id}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg
                ${isSelected 
                  ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg ring-1 ring-primary/20' 
                  : 'border border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              onClick={() => onServiceSelect(service.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        {service.popularity === 'Mest populært' && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Populær
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="bg-background/80 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs">Potensielle besparelser</div>
                    <div className="font-semibold text-green-600">{service.avgSavings} kr</div>
                  </div>
                  <div className="bg-background/80 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs">Tidsramme</div>
                    <div className="font-semibold">{service.timeframe}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {service.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trust Signals */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <Shield className="w-4 h-4" />
            <span>100% gratis og uforpliktende</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Users className="w-4 h-4" />
            <span>Kun kvalitetssikrede leverandører</span>
          </div>
        </div>
      </div>
    </div>
  );
};