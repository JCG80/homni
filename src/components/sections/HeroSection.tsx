
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
        console.log(`Starting registration for ${selectedService} (${activeTab})`);
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
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Role Toggle */}
        <div className="flex justify-center mb-8">
          <ToggleGroup 
            type="single" 
            value={activeTab}
            onValueChange={handleRoleToggle}
            className="bg-white/20 p-1 rounded-md"
          >
            <ToggleGroupItem 
              value="private" 
              className="text-base px-5 py-2 rounded data-[state=on]:bg-white data-[state=on]:text-primary"
            >
              Privatperson
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="business" 
              className="text-base px-5 py-2 rounded data-[state=on]:bg-white data-[state=on]:text-primary"
            >
              Bedrift
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          {activeTab === 'private' 
            ? 'Få kontroll på strøm, forsikring og mobil' 
            : 'Finn de beste tilbudene for din bedrift'}
        </h1>
        
        {/* Hero Description */}
        <p className="text-xl mb-8 text-center max-w-2xl mx-auto">
          Sammenlign leverandører og spar penger. Det er gratis og uforpliktende.
        </p>

        {/* Quick service selection - Minimalist Icon Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {quickSelections.map(service => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all
                ${selectedService === service.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'}
              `}
            >
              <div className="mb-2">
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
            className="w-full py-6 text-lg flex items-center justify-center"
          >
            Få tilbud <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 text-center text-sm text-white/80">
          <p>Steg 1 av 3 – Tar under 1 minutt</p>
          <Progress value={33} className="h-2 mt-2 bg-white/30" />
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
