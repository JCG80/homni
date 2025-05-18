
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Building, Coins, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const handleServiceSelection = () => {
    navigate('/select-services');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Sammenlign og håndter dine tjenester på ett sted
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Vi hjelper deg med å finne de beste tilbudene på forsikring, eiendomstjenester og finansieringsløsninger.
          </p>
          <Button
            onClick={handleServiceSelection}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            Kom i gang <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Våre tjenester</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Forsikring</h3>
              <p className="text-gray-600 mb-4">
                Få tilbud på ulike typer forsikringer for deg og familien din
              </p>
              <Button variant="outline" onClick={() => navigate('/select-services')}>
                Les mer
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Eiendom</h3>
              <p className="text-gray-600 mb-4">
                Få hjelp med boligkjøp, -salg og -finansiering
              </p>
              <Button variant="outline" onClick={() => navigate('/select-services')}>
                Les mer
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Coins className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Finans</h3>
              <p className="text-gray-600 mb-4">
                Få rådgivning om lån, sparing og pensjon
              </p>
              <Button variant="outline" onClick={() => navigate('/select-services')}>
                Les mer
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Klar til å finne de beste tilbudene?</h2>
          <p className="text-xl mb-8">
            Start nå for å sammenligne og administrere tjenestene dine enkelt og effektivt.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={handleServiceSelection}
            className="px-8 py-6 text-lg"
          >
            Utforsk tjenester <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
