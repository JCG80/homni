
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { InsuranceSection } from '@/components/sections/InsuranceSection';
import { CallToAction } from '@/components/sections/CallToAction';
import { Footer } from '@/components/layout/Footer';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState<string>('private');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} handleTabChange={handleTabChange} />
      <HeroSection activeTab={activeTab} handleTabChange={handleTabChange} />
      <ServicesSection activeTab={activeTab} />
      <InsuranceSection />
      <CallToAction activeTab={activeTab} />
      <Footer />
    </div>
  );
};
