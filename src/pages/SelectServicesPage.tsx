import React from 'react';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Hammer, Zap, PiggyBank, Heart, Wifi, Car, Shield, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  services: string[];
  popular: boolean;
  forRole?: 'private' | 'business' | 'both';
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'handwork',
    name: 'Håndverkere',
    icon: Hammer,
    description: 'Profesjonelle håndverkstjenester for hjemmet',
    services: ['Rørlegger', 'Elektriker', 'Maler', 'Tømrer', 'Fliselegger'],
    popular: true,
    forRole: 'both'
  },
  {
    id: 'energy',
    name: 'Energi',
    icon: Zap,
    description: 'Spar penger på energi og oppvarming',
    services: ['Varmepumpe', 'Solceller', 'Strøm', 'Energirådgivning'],
    popular: true,
    forRole: 'both'
  },
  {
    id: 'finance',
    name: 'Økonomi',
    icon: PiggyBank,
    description: 'Forsikring og finansielle tjenester',
    services: ['Boligforsikring', 'Refinansiering', 'Bankbytte', 'Innboforsikring'],
    popular: true,
    forRole: 'private'
  },
  {
    id: 'accessibility',
    name: 'Tilgjengelighet',
    icon: Heart,
    description: 'Tilpassinger for økt tilgjengelighet',
    services: ['Trappelift', 'Ramper', 'Badtilpasning', 'Døråpnere'],
    popular: false,
    forRole: 'private'
  },
  {
    id: 'internet',
    name: 'Internett & TV',
    icon: Wifi,
    description: 'Bredbånd og TV-tjenester',
    services: ['Fiber', 'Mobilt bredbånd', 'TV-pakker', 'Streaming'],
    popular: true,
    forRole: 'both'
  },
  {
    id: 'business_fleet',
    name: 'Bilflåte',
    icon: Car,
    description: 'Flåtestyring og leasingløsninger',
    services: ['Billeasing', 'Flåtestyring', 'Benforsikring', 'Service'],
    popular: false,
    forRole: 'business'
  },
  {
    id: 'business_insurance',
    name: 'Bedriftsforsikring',
    icon: Shield,
    description: 'Forsikringsløsninger for bedrifter',
    services: ['Yrkesskadeforsikring', 'Ansvarsforsikring', 'Innboforsikring', 'Cyberforsikring'],
    popular: true,
    forRole: 'business'
  },
  {
    id: 'facility',
    name: 'Eiendomsdrift',
    icon: Building,
    description: 'Drift og vedlikehold av bedriftseiendom',
    services: ['Renhold', 'Sikkerhet', 'Vedlikehold', 'Energioptimalisering'],
    popular: false,
    forRole: 'business'
  }
];

export const SelectServicesPage = () => {
  const [selectedRole, setSelectedRole] = React.useState<'private' | 'business'>('private');
  
  React.useEffect(() => {
    const savedRole = localStorage.getItem('visitor_role') as 'private' | 'business';
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const filteredCategories = serviceCategories.filter(
    category => category.forRole === 'both' || category.forRole === selectedRole
  );

  return (
    <>
      <Helmet>
        <title>Tjenester - Homni</title>
        <meta name="description" content="Utforsk alle tjenester vi tilbyr. Sammenlign priser og få tilbud fra kvalitetsleverandører." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Alle tjenester</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Utforsk våre tjenestekategorier og få tilbud fra kvalitetsleverandører
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-lg p-1 flex">
              <Button
                variant={selectedRole === 'private' ? 'default' : 'ghost'}
                onClick={() => setSelectedRole('private')}
                className="rounded-md"
              >
                Privat
              </Button>
              <Button
                variant={selectedRole === 'business' ? 'default' : 'ghost'}
                onClick={() => setSelectedRole('business')}
                className="rounded-md"
              >
                Bedrift
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                  </div>
                  {category.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Populær
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-4">{category.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {category.services.slice(0, 4).map((service) => (
                    <li key={service} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                  {category.services.length > 4 && (
                    <li className="text-sm text-muted-foreground">
                      + {category.services.length - 4} flere tjenester
                    </li>
                  )}
                </ul>
                
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link 
                    to="/" 
                    state={{ preselectedService: category.name, preselectedRole: selectedRole }}
                  >
                    Få tilbud <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Ikke funnet det du leter etter?</h2>
            <p className="text-muted-foreground mb-6">
              Vi hjelper deg gjerne med å finne den riktige leverandøren for ditt behov
            </p>
            <Button asChild size="lg">
              <Link to="/">
                Start sammenligningen <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
};