import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { InsuranceSection } from '@/components/sections/InsuranceSection';
import { CallToAction } from '@/components/sections/CallToAction';
import { QuickLoginUnified } from '@/components/auth/QuickLoginUnified';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('private');
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // If authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/dashboard/${role}`, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // If user is authenticated, don't show the landing page
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Omdirigerer til dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} handleTabChange={handleTabChange} />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Services Section */}
        <ServicesSection />
        
        {/* Quick Login Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Kom i gang i dag</h2>
              <p className="text-lg text-muted-foreground mb-12">
                Velg hvordan du vil bruke Homni og få tilgang til alle våre tjenester
              </p>
              
              <QuickLoginUnified showHeader={false} defaultTab={activeTab as 'private' | 'business'} />
            </div>
          </div>
        </section>
        
        {/* Insurance Section */}
        <InsuranceSection />
        
        {/* Call to Action */}
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  );
};
