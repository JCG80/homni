
import React, { useState } from 'react';
import { ArrowRight, Home, Car, Phone, Zap, Link, Shield } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ServiceSelector } from '@/components/landing/ServiceSelector';
import { ExampleTags } from '@/components/landing/ExampleTags';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

export const HeroSection = ({ activeTab, handleTabChange }: HeroSectionProps) => {
  const [selectedService, setSelectedService] = useState<string>("");
  const navigate = useNavigate();

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  const handleRoleToggle = (value: string) => {
    if (value) {
      handleTabChange(value);
      setSelectedService("");
    }
  };

  const handleGetOffer = () => {
    if (selectedService) {
      if (selectedService === 'strom' || selectedService === 'energiavtaler') {
        navigate('/strom');
      } else if (selectedService === 'forsikring' || selectedService === 'bedriftsforsikring') {
        navigate('/insurance/quote');
      } else {
        // Handle other services - navigate to appropriate page or show form
        navigate('/register');
      }
    }
  };

  // Service icons
  const serviceIcons = {
    strom: <Zap className="h-6 w-6" />,
    forsikring: <Shield className="h-6 w-6" />,
    mobil: <Phone className="h-6 w-6" />,
    bredband: <Link className="h-6 w-6" />,
    energiavtaler: <Zap className="h-6 w-6" />,
    bedriftsforsikring: <Shield className="h-6 w-6" />
  };

  // Quick selection buttons with icons
  const quickSelections = [
    { id: 'strom', name: 'Strøm', icon: <Zap className="h-5 w-5" /> },
    { id: 'forsikring', name: 'Forsikring', icon: <Shield className="h-5 w-5" /> },
    { id: 'mobil', name: 'Mobil', icon: <Phone className="h-5 w-5" /> },
    { id: 'bredband', name: 'Bredbånd', icon: <Link className="h-5 w-5" /> }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/10 to-transparent py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Role Toggle */}
        <div className="flex justify-center mb-10">
          <ToggleGroup 
            type="single" 
            value={activeTab}
            onValueChange={handleRoleToggle}
            className="bg-white/50 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-white/50"
          >
            <ToggleGroupItem 
              value="private" 
              className="text-base px-6 py-2.5 rounded-md data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all duration-200"
            >
              Privatperson
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="business" 
              className="text-base px-6 py-2.5 rounded-md data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all duration-200"
            >
              Bedrift
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-center leading-tight">
          {activeTab === 'private' 
            ? 'Få kontroll på strøm, forsikring og mobil' 
            : 'Finn de beste tilbudene for din bedrift'}
        </h1>
        
        {/* Hero Description */}
        <p className="text-xl mb-10 text-center max-w-2xl mx-auto opacity-90">
          Sammenlign leverandører og spar penger. Det er gratis og uforpliktende.
        </p>

        {/* Quick service selection - Enhanced Icon Buttons */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {quickSelections.map(service => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`
                flex flex-col items-center p-4 rounded-xl transition-all
                ${selectedService === service.id 
                  ? 'bg-primary text-white shadow-md scale-105' 
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-1'}
              `}
              aria-label={`Select ${service.name} service`}
            >
              <div className={`mb-2 p-2 rounded-full ${selectedService === service.id ? 'bg-white/20' : 'bg-primary/5'}`}>
                {service.icon}
              </div>
              <span className="text-sm font-medium">{service.name}</span>
            </button>
          ))}
        </div>

        {/* Advanced selection with dropdown */}
        <div className="space-y-6 max-w-xl mx-auto">
          <ServiceSelector 
            userType={activeTab as 'private' | 'business'} 
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
          />

          {/* CTA Button */}
          <Button 
            onClick={handleGetOffer}
            disabled={!selectedService}
            size="lg"
            className={`
              w-full py-6 text-lg font-medium flex items-center justify-center gap-2 
              transition-all duration-300 
              ${!selectedService 
                ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                : 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20'}
            `}
          >
            Få tilbud <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="mt-8 text-center text-sm text-gray-700">
          <p>Steg 1 av 3 – Tar under 1 minutt</p>
          <Progress value={33} className="h-2 mt-2 bg-white/50 max-w-md mx-auto rounded-full" />
        </div>

        {/* Example Tags */}
        <div className="mt-8">
          <ExampleTags 
            userType={activeTab as 'private' | 'business'} 
            onTagSelect={handleServiceSelect}
            selectedService={selectedService}
          />
        </div>
      </div>
    </section>
  );
};
