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
  Clock,
  Home,
  Sun,
  Thermometer
} from 'lucide-react';
import { WizardRole } from '@/types/wizard-types';

interface EnhancedServiceSelectionProps {
  role: WizardRole;
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

const privateServices = [
  {
    id: 'power-comparison',
    name: 'Strømavtale',
    icon: Zap,
    description: 'Sammenlign og bytt til billigste strømavtale',
    avgSavings: '3,200',
    popularity: 95,
    timeframe: '2-3 dager',
    details: ['Helt gratis tjeneste', 'Kun 2 min å fylle ut', 'Sparer deg for tusener', 'Får tilbud fra 20+ leverandører']
  },
  {
    id: 'insurance',
    name: 'Forsikring',
    icon: Shield,
    description: 'Finn beste forsikring for dine behov',
    avgSavings: '2,800',
    popularity: 88,
    timeframe: '1-2 dager',
    details: ['Sammenligner alle selskaper', 'Personlig rådgivning', 'Ingen skjulte gebyrer', 'Trygg og sikker tjeneste']
  },
  {
    id: 'mortgage',
    name: 'Boliglån',
    icon: Home,
    description: 'Få beste rente på boliglånet ditt',
    avgSavings: '15,000',
    popularity: 92,
    timeframe: '3-5 dager',
    details: ['Forhandler med 15+ banker', 'Gratis rentesjekk', 'Ekspertråd inkludert', 'Kan spare deg for tusenvis']
  },
  {
    id: 'solar',
    name: 'Solceller',
    icon: Sun,
    description: 'Installer solceller og spar penger',
    avgSavings: '25,000',
    popularity: 78,
    timeframe: '1-2 uker',
    details: ['Gratis befaring og tilbud', 'Opp til 90% støtte', 'Profesjonell installasjon', '20 års garanti']
  },
  {
    id: 'heating',
    name: 'Varmepumpe',
    icon: Thermometer,
    description: 'Installer energieffektiv varmepumpe',
    avgSavings: '8,500',
    popularity: 85,
    timeframe: '5-7 dager',
    details: ['Miljøvennlig oppvarming', 'Statlige støtteordninger', 'Kvalitetssikret installasjon', 'Reduserte strømregninger']
  },
  {
    id: 'eiendom',
    name: 'Eiendom',
    icon: Home,
    description: 'Få hjelp med boligkjøp, -salg og -finansiering',
    avgSavings: '12,000',
    popularity: 82,
    timeframe: '1-2 uker',
    details: ['Ekspert eiendomsmegling', 'Markedsanalyse inkludert', 'Juridisk bistand', 'Maksimer boligens verdi']
  }
];

const businessServices = [
  {
    id: 'business-power',
    name: 'Bedrift Strømavtale',
    icon: Zap,
    description: 'Kraftavtaler tilpasset bedrifter',
    avgSavings: '25,000',
    popularity: 89,
    timeframe: '3-5 dager',
    details: ['Forhandler gruppeavtaler', 'Fleksible leveringstider', 'Dedicated kundeservice', 'Risikostyring inkludert']
  },
  {
    id: 'business-insurance',
    name: 'Bedriftsforsikring',
    icon: Shield,
    description: 'Omfattende forsikring for bedriften',
    avgSavings: '18,000',
    popularity: 85,
    timeframe: '5-7 dager',
    details: ['Skreddersydde løsninger', 'Ansvarsforsikring inkludert', 'Skadeforebyggende tiltak', '24/7 skadeservice']
  },
  {
    id: 'business-finance',
    name: 'Bedriftsfinans',
    icon: TrendingUp,
    description: 'Lån og finansiering for bedrifter',
    avgSavings: '45,000',
    popularity: 78,
    timeframe: '1-2 uker',
    details: ['Konkurransedyktige renter', 'Fleksible nedbetalinger', 'Rask saksbehandling', 'Ingen skjulte gebyrer']
  },
  {
    id: 'business-energy',
    name: 'Energiløsninger',
    icon: Sun,
    description: 'Helhetlige energiløsninger for bedrifter',
    avgSavings: '85,000',
    popularity: 72,
    timeframe: '2-4 uker',
    details: ['Solceller og batterier', 'Smart energistyring', 'Enova-støtte inkludert', 'Miljøsertifisering']
  },
  {
    id: 'business-consulting',
    name: 'Bedriftsrådgivning',
    icon: Users,
    description: 'Strategisk rådgivning og vekststøtte',
    avgSavings: '65,000',
    popularity: 68,
    timeframe: '1-3 uker',
    details: ['Erfarne konsulenter', 'Bransjespesifikk ekspertise', 'Digitalisering', 'Prosessoptimalisering']
  },
  {
    id: 'eiendom',
    name: 'Eiendom',
    icon: Home,
    description: 'Få hjelp med næringseiendommer og investeringer',
    avgSavings: '125,000',
    popularity: 75,
    timeframe: '2-6 uker',
    details: ['Kommersiell eiendomsmegling', 'Investeringsanalyse', 'Finansieringsbistand', 'Markedsvurderinger']
  },
  {
    id: 'finans',
    name: 'Finans',
    icon: TrendingUp,
    description: 'Få rådgivning om lån, sparing og pensjon for bedrifter',
    avgSavings: '32,000',
    popularity: 80,
    timeframe: '1-2 uker',
    details: ['Pensjonsordninger', 'Likviditetsstyring', 'Investeringsrådgivning', 'Skatteoptimalisering']
  }
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
                        {service.popularity >= 90 && (
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