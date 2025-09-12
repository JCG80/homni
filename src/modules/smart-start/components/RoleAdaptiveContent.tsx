import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '@/modules/auth/normalizeRole';
// removed unused NavigationConfig import
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowRight, 
  Building, 
  User, 
  Zap, 
  Shield, 
  Smartphone, 
  Wifi,
  Star,
  Clock,
  Users
} from 'lucide-react';

interface RoleAdaptiveContentProps {
  role: UserRole;
  isAuthenticated: boolean;
  searchStep: number;
  searchQuery: string;
  searchResults: any[];
  availableModules: string[];
  navigationItems: any[];
  onSearch: (query: string) => void;
  onStepComplete: (stepData: any) => void;
  onReset: () => void;
}

const serviceCategories = {
  private: [
    { id: 'strom', name: 'Strøm', icon: Zap, desc: 'Sammenlign strømpriser', popular: true },
    { id: 'forsikring', name: 'Forsikring', icon: Shield, desc: 'Finn beste forsikring' },
    { id: 'mobil', name: 'Mobil', icon: Smartphone, desc: 'Mobilabonnement' },
    { id: 'internett', name: 'Internett', icon: Wifi, desc: 'Bredbånd og fiber' }
  ],
  business: [
    { id: 'energi', name: 'Energiløsninger', icon: Zap, desc: 'Bedriftsenergí og solceller', popular: true },
    { id: 'forsikring', name: 'Bedriftsforsikring', icon: Shield, desc: 'Dekning for bedriften' },
    { id: 'flate', name: 'Flåtestyring', icon: Users, desc: 'Kjøretøy og logistikk' },
    { id: 'it', name: 'IT-tjenester', icon: Wifi, desc: 'Digitale løsninger' }
  ]
};

export const RoleAdaptiveContent: React.FC<RoleAdaptiveContentProps> = ({
  role,
  isAuthenticated,
  searchStep,
  searchQuery,
  searchResults,
  availableModules,
  navigationItems,
  onSearch,
  onStepComplete,
  onReset
}) => {
  const [currentQuery, setCurrentQuery] = React.useState(searchQuery);
  const [selectedService, setSelectedService] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');

  const services = serviceCategories[role === 'company' ? 'business' : 'private'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      onSearch(service.name);
      onStepComplete({ service: serviceId, serviceName: service.name });
    }
  };

  const handleLocationSubmit = () => {
    if (postalCode.length >= 4) {
      onStepComplete({ postalCode, location: `Postnummer ${postalCode}` });
    }
  };

  const renderSearchStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Quick Search */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder={role === 'company' ? 'Søk bedriftstjenester...' : 'Søk tjenester...'}
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg rounded-full"
            autoFocus
          />
          <Button 
            type="submit" 
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card 
              key={service.id}
              className={`
                p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${selectedService === service.id ? 'ring-2 ring-primary bg-primary/5' : ''}
              `}
              onClick={() => handleServiceSelect(service.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.popular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Populær
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Role-specific benefits */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          {role === 'company' ? <Building className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
          <h4 className="font-semibold">
            {role === 'company' ? 'Bedriftsfordeler' : 'Privatfordeler'}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-success" />
            <span>Svar på under 1 time</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span>Kun verifiserte leverandører</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-success" />
            <span>Gratis og uforpliktende</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLocationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center"
    >
      <h2 className="text-2xl font-semibold mb-4">Hvor skal tjenesten utføres?</h2>
      <p className="text-muted-foreground mb-6">
        Vi bruker postnummeret for å finne de beste leverandørene i ditt område
      </p>
      
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Skriv inn postnummer"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="text-center text-lg h-12"
          maxLength={4}
          pattern="[0-9]*"
          autoFocus
        />
        
        <Button 
          onClick={handleLocationSubmit}
          disabled={postalCode.length < 4}
          size="lg"
          className="w-full"
        >
          Fortsett
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderContactStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center"
    >
      <h2 className="text-2xl font-semibold mb-4">Nesten ferdig!</h2>
      <p className="text-muted-foreground mb-6">
        Oppgi e-postadressen din så sender vi deg de beste tilbudene
      </p>
      
      {/* This would integrate with the existing contact form from VisitorWizard */}
      <div className="p-6 bg-card rounded-lg border">
        <p className="text-sm text-muted-foreground">
          Kontaktskjema kommer her...
        </p>
      </div>
    </motion.div>
  );

  const renderCompletionStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <div className="p-8 bg-success/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Search className="w-12 h-12 text-success" />
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Takk for din interesse!</h2>
      <p className="text-muted-foreground mb-6">
        Vi jobber nå med å finne de beste tilbudene for deg. 
        Du vil høre fra oss innen 24 timer.
      </p>
      
      <Button onClick={onReset} variant="outline">
        Start et nytt søk
      </Button>
    </motion.div>
  );

  // Render different content based on search step
  switch (searchStep) {
    case 1:
      return renderSearchStep();
    case 2:
      return renderLocationStep();
    case 3:
      return renderContactStep();
    case 4:
      return renderCompletionStep();
    default:
      return renderSearchStep();
  }
};