
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const ProjectPlanPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Tilbake til forsiden
        </Button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Prosjektplan</h1>
          <p className="text-gray-600">
            Oversikt over våre planer for plattformen
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Prosjektets mål</h2>
          <p className="text-gray-700 mb-6">
            Målet med dette prosjektet er å skape en integrert plattform for sammenligning og 
            administrasjon av tjenester innen forsikring, eiendom og finans. Plattformen skal 
            gjøre det enkelt for brukere å finne de beste tilbudene basert på deres behov.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Hovedfunksjoner</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Forsikringssammenligning og tilbud</li>
            <li>Eiendomstjenester og finansiering</li>
            <li>Finansielle rådgivningstjenester</li>
            <li>Brukertilpassede anbefalinger</li>
            <li>Administrasjon av egne tjenester</li>
            <li>Integrasjon med tjenesteleverandører</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Utviklingsplan</h2>
          <div className="space-y-4 mb-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-medium">Fase 1: Grunnleggende funksjonalitet (Fullført)</h3>
              <p className="text-gray-600">Oppsett av plattformen, brukerautentisering og grunnleggende sammenligning av tjenester.</p>
            </div>
            
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-medium">Fase 2: Lead-håndtering (Pågår)</h3>
              <p className="text-gray-600">Implementering av system for håndtering av forespørsler og kobling til tjenesteleverandører.</p>
            </div>
            
            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-medium">Fase 3: Avanserte sammenligningsverktøy</h3>
              <p className="text-gray-600">Utvikling av mer avanserte verktøy for sammenligning og analyse av tjenester.</p>
            </div>
            
            <div className="border-l-4 border-gray-300 pl-4">
              <h3 className="font-medium">Fase 4: Integrasjon med flere leverandører</h3>
              <p className="text-gray-600">Utvidelse av plattformen med flere tjenesteleverandører og tjenestekategorier.</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Tilbake til forsiden
            </Button>
            
            <Button 
              onClick={() => navigate('/select-services')}
            >
              Utforsk tjenester <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
