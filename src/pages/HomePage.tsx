
import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CallToAction } from '@/components/sections/CallToAction';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ServiceSelectionFlow } from '@/modules/services/components/ServiceSelectionFlow';
import { Service } from '@/modules/services/types/services';
import { useServiceLeadCreation } from '@/modules/leads/hooks/useServiceLeadCreation';

export const HomePage = () => {
  const navigate = useNavigate();
  const { createLeadFromService, isCreating } = useServiceLeadCreation();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleCreateLead = (service: Service) => {
    createLeadFromService(service);
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <CallToAction />
    </div>
  );
};

export default HomePage;
