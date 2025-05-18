
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQPage = () => {
  const navigate = useNavigate();
  
  const faqItems = [
    {
      question: "Hvordan sammenligner jeg tjenester?",
      answer: "Du kan sammenligne tjenester ved å gå til 'Velg tjenester' siden og velge kategorien du er interessert i. For hver kategori vil du kunne se ulike tilbydere og sammenligne deres tilbud basert på pris, vilkår og andre relevante faktorer."
    },
    {
      question: "Hvordan oppretter jeg en konto?",
      answer: "Du kan opprette en konto ved å klikke på 'Logg inn' knappen i øvre høyre hjørne og deretter velge 'Registrer deg'. Fyll ut det påkrevde skjemaet med din e-post og passord for å opprette en konto."
    },
    {
      question: "Hvordan administrerer jeg mine forespørsler?",
      answer: "Etter at du har logget inn, kan du gå til 'Forespørsler' siden fra dashbordet eller hovedmenyen. Her vil du se alle dine aktive forespørsler og deres status. Du kan også oppdatere eller slette eksisterende forespørsler."
    },
    {
      question: "Hva er fordelene med å registrere seg?",
      answer: "Ved å registrere deg får du muligheten til å lagre sammenligninger, motta personlige tilbud, spore status på forespørsler, og få varsler om nye tilbud som passer dine preferanser."
    },
    {
      question: "Hvordan fungerer sammenligningen av strømavtaler?",
      answer: "Vår strømsammenligning viser deg aktuelle tilbud basert på ditt forbruk og postnummer. Vi viser både fastpris og spotprisavtaler, og regner ut estimert årskostnad slik at du enkelt kan sammenligne ulike avtaler."
    },
    {
      question: "Hvordan kommer jeg i kontakt med kundeservice?",
      answer: "Du kan kontakte vår kundeservice ved å sende en e-post til support@homni.no eller ringe oss på +47 XX XX XX XX i åpningstiden mandag til fredag 09:00-16:00."
    }
  ];
  
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
          <h1 className="text-3xl font-bold mb-2">Ofte stilte spørsmål</h1>
          <p className="text-gray-600">
            Finn svar på vanlige spørsmål om våre tjenester
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Fant du ikke svaret du lette etter?</h2>
            <p className="mb-4">Ta kontakt med oss så hjelper vi deg gjerne.</p>
            <Button 
              onClick={() => navigate('/contact')}
              className="mr-4"
            >
              Kontakt oss
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/docs/project-plan')}
            >
              Les prosjektplan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
