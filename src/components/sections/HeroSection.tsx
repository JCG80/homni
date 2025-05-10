
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistrationFlow } from '@/components/landing/RegistrationFlow';

interface HeroSectionProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

export const HeroSection = ({ activeTab, handleTabChange }: HeroSectionProps) => {
  return (
    <section className="bg-gradient-to-br from-primary/80 to-primary py-12 md:py-16 text-white">
      <div className="container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-3xl mx-auto">
          <TabsList className="w-full mb-8 bg-white/20 grid grid-cols-2">
            <TabsTrigger value="private" className="text-lg py-3 data-[state=active]:bg-transparent data-[state=active]:font-bold">Privatperson</TabsTrigger>
            <TabsTrigger value="business" className="text-lg py-3 data-[state=active]:bg-transparent data-[state=active]:font-bold">Bedrift</TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Spar penger på dine faste utgifter</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Sammenlign og bytt leverandører enkelt. Vi hjelper deg å finne de beste tilbudene på strøm, 
              forsikring, bredbånd og mobilabonnement.
            </p>
            
            <RegistrationFlow userType="private" />
          </TabsContent>
          
          <TabsContent value="business" className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Smarte løsninger for bedrifter</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Vi hjelper bedrifter med å finne de beste avtalene på strøm, forsikring, 
              bredbånd og mobilabonnementer. Spar penger og tid med våre tjenester.
            </p>
            
            <RegistrationFlow userType="business" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
