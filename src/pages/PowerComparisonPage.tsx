
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceComparison } from '@/components/ui/price-comparison';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const PowerComparisonPage = () => {
  const [postnr, setPostnr] = useState('');
  const [consumption, setConsumption] = useState(16000);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState('spot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postnr || postnr.length !== 4) {
      toast({
        title: "Ugyldig postnummer",
        description: "Vennligst oppgi et gyldig postnummer (4 siffer)",
        variant: "destructive"
      });
      return;
    }
    setShowResults(true);
  };

  const handleSelect = (id: string) => {
    toast({
      title: "Strømleverandør valgt",
      description: `Du har valgt ${id}. En representant vil kontakte deg snart.`,
    });
  };

  const mockComparisonData = [
    {
      id: 'fjordkraft-spot',
      name: 'Fjordkraft',
      price: 89.9,
      features: ['Spotpris + 4,9 øre/kWh', 'Ingen bindingstid', 'Månedsavgift: 49 kr'],
      highlight: true,
      label: 'Populær'
    },
    {
      id: 'tibber-spot',
      name: 'Tibber',
      price: 79.9,
      features: ['Spotpris + 0 øre/kWh', 'App med forbruksoversikt', 'Månedsavgift: 39 kr'],
    },
    {
      id: 'norgesenergi-spot',
      name: 'NorgesEnergi',
      price: 84.5,
      features: ['Spotpris + 3,9 øre/kWh', 'Første måned gratis', 'Månedsavgift: 39 kr'],
    }
  ];

  const mockFixedData = [
    {
      id: 'fjordkraft-fixed',
      name: 'Fjordkraft Fastpris',
      price: 109.9,
      features: ['Fastpris i 12 måneder', 'Forutsigbare kostnader', 'Ingen månedsavgift'],
      highlight: true,
      label: 'Populær'
    },
    {
      id: 'lyse-fixed',
      name: 'Lyse Fastpris',
      price: 119.5,
      features: ['Fastpris i 36 måneder', 'Ingen prisendringer', 'Månedsavgift: 0 kr'],
    },
    {
      id: 'hafslund-fixed',
      name: 'Hafslund Fastpris',
      price: 114.9,
      features: ['Fastpris i 24 måneder', 'Grønn strøm', 'Månedsavgift: 0 kr'],
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">Homni</Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Logg inn</Button>
            </Link>
            <Link to="/register">
              <Button>Registrer</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <Link to="/" className="text-primary hover:underline flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
              Tilbake til forsiden
            </Link>
            <h1 className="text-3xl font-bold">Sammenlign strømpriser</h1>
            <p className="text-muted-foreground mt-2">
              Finn den beste strømavtalen for din bolig
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Form */}
            <div className="lg:col-span-1">
              <div className="bg-card border rounded-lg p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Finn beste strømavtale</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="postnr">Postnummer</Label>
                    <Input
                      id="postnr"
                      placeholder="Skriv inn postnummer"
                      value={postnr}
                      onChange={(e) => setPostnr(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="consumption">Årsforbruk: {consumption} kWh</Label>
                    <Slider
                      id="consumption"
                      value={[consumption]}
                      onValueChange={(values) => setConsumption(values[0])}
                      min={1000}
                      max={30000}
                      step={1000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 000 kWh</span>
                      <span>30 000 kWh</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Avtaletype</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Velg avtaletype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spot">Spotpris</SelectItem>
                        <SelectItem value="fixed">Fastpris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Sammenlign priser
                  </Button>
                </form>
              </div>
            </div>
            
            {/* Results */}
            <div className="lg:col-span-2">
              {!showResults ? (
                <div className="bg-card border rounded-lg p-8 text-center">
                  <div className="mx-auto w-16 h-16 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2-5.5 9h11L12 2z"/><path d="m12 22 5.5-9h-11L12 22z"/></svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Finn strømleverandør</h2>
                  <p className="text-muted-foreground mb-4">
                    Fyll ut skjemaet for å se sammenligning av strømleverandører i ditt område.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">Resultater for {postnr}</h2>
                        <p className="text-muted-foreground">
                          Basert på {consumption} kWh årsforbruk
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setShowResults(false)}>
                        Endre søk
                      </Button>
                    </div>
                    
                    <div className="space-y-8">
                      <PriceComparison
                        title={selectedType === 'spot' ? "Spotprisavtaler" : "Fastprisavtaler"}
                        description={`Estimert månedlig kostnad basert på ${consumption} kWh årsforbruk`}
                        items={selectedType === 'spot' ? mockComparisonData : mockFixedData}
                        onSelect={handleSelect}
                        currency="kr/mnd"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Vanlige spørsmål</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Hva er forskjellen på spotpris og fastpris?</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Spotprisavtaler følger markedsprisene på strømbørsen og kan variere fra time til time. Fastprisavtaler gir deg en forutsigbar pris i avtaleperioden.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Hvor lang bindingstid er det?</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Spotprisavtaler har vanligvis ingen bindingstid, mens fastprisavtaler binder deg for en bestemt periode (typisk 1-3 år).
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Kan jeg bytte strømleverandør når som helst?</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Ja, med spotprisavtaler kan du bytte når som helst, mens med fastprisavtaler kan det være gebyrer for å avslutte avtalen før tiden.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Homni AS. Alle rettigheter reservert.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/personvern" className="text-muted-foreground hover:text-foreground text-sm">
                Personvern
              </Link>
              <Link to="/vilkår" className="text-muted-foreground hover:text-foreground text-sm">
                Vilkår
              </Link>
              <Link to="/kontakt" className="text-muted-foreground hover:text-foreground text-sm">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
