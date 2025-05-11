
import React from 'react';
import { Button } from '@/components/ui/button';
import { PriceComparison } from '@/components/ui/price-comparison';

interface PowerComparisonResultsProps {
  showResults: boolean;
  postnr: string;
  consumption: number;
  selectedType: string;
  handleSelect: (id: string) => void;
  resetSearch: () => void;
}

export const PowerComparisonResults: React.FC<PowerComparisonResultsProps> = ({
  showResults,
  postnr,
  consumption,
  selectedType,
  handleSelect,
  resetSearch
}) => {
  // Generate a monthly price based on consumption and a base rate
  const calculateMonthlyPrice = (baseRate: number, consumption: number): number => {
    const annualConsumption = consumption;
    const monthlyConsumption = annualConsumption / 12;
    // Convert øre/kWh to kr and multiply by consumption
    return Math.round((baseRate / 100) * monthlyConsumption);
  };

  // Spot price electricity providers data
  const spotPriceProviders = [
    {
      id: 'tibber-spot',
      name: 'Tibber',
      price: calculateMonthlyPrice(79.9, consumption),
      features: ['Spotpris + 0 øre/kWh', 'App med forbruksoversikt', 'Månedsavgift: 39 kr'],
      highlight: true,
      label: 'Populær'
    },
    {
      id: 'fjordkraft-spot',
      name: 'Fjordkraft',
      price: calculateMonthlyPrice(84.5, consumption),
      features: ['Spotpris + 4,9 øre/kWh', 'Ingen bindingstid', 'Månedsavgift: 49 kr'],
    },
    {
      id: 'norgesenergi-spot',
      name: 'NorgesEnergi',
      price: calculateMonthlyPrice(83.2, consumption),
      features: ['Spotpris + 3,9 øre/kWh', 'Første måned gratis', 'Månedsavgift: 39 kr'],
    },
    {
      id: 'agva-spot',
      name: 'Agva Kraft',
      price: calculateMonthlyPrice(80.5, consumption),
      features: ['Spotpris + 2,5 øre/kWh', 'Strøm til innkjøpspris', 'Månedsavgift: 45 kr'],
    },
    {
      id: 'fortum-spot',
      name: 'Fortum',
      price: calculateMonthlyPrice(82.0, consumption),
      features: ['Spotpris + 3,5 øre/kWh', 'App med forbrukoversikt', 'Månedsavgift: 45 kr'],
    }
  ];

  // Fixed price electricity providers data
  const fixedPriceProviders = [
    {
      id: 'fjordkraft-fixed',
      name: 'Fjordkraft Fastpris',
      price: calculateMonthlyPrice(109.9, consumption),
      features: ['Fastpris i 12 måneder', 'Forutsigbare kostnader', 'Ingen månedsavgift'],
      highlight: true,
      label: 'Populær'
    },
    {
      id: 'lyse-fixed',
      name: 'Lyse Fastpris',
      price: calculateMonthlyPrice(119.5, consumption),
      features: ['Fastpris i 36 måneder', 'Ingen prisendringer', 'Månedsavgift: 0 kr'],
    },
    {
      id: 'hafslund-fixed',
      name: 'Hafslund Fastpris',
      price: calculateMonthlyPrice(114.9, consumption),
      features: ['Fastpris i 24 måneder', 'Grønn strøm', 'Månedsavgift: 0 kr'],
    },
    {
      id: 'nve-fixed',
      name: 'NTE Fastpris',
      price: calculateMonthlyPrice(112.5, consumption),
      features: ['Fastpris i 12 måneder', '100% fornybar energi', 'Månedsavgift: 0 kr'],
    },
    {
      id: 'folkekraft-fixed',
      name: 'Folkekraft Fastpris',
      price: calculateMonthlyPrice(107.8, consumption),
      features: ['Fastpris i 6 måneder', 'Miljøvennlig strøm', 'Månedsavgift: 0 kr'],
    }
  ];

  if (!showResults) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 text-primary mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2-5.5 9h11L12 2z"/><path d="m12 22 5.5-9h-11L12 22z"/></svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Finn strømleverandør</h2>
        <p className="text-muted-foreground mb-4">
          Fyll ut skjemaet for å se sammenligning av strømleverandører i ditt område.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Resultater for {postnr}</h2>
            <p className="text-muted-foreground">
              Basert på {consumption} kWh årsforbruk
            </p>
          </div>
          <Button variant="outline" onClick={resetSearch}>
            Endre søk
          </Button>
        </div>
        
        <div className="space-y-8">
          <PriceComparison
            title={selectedType === 'spot' ? "Spotprisavtaler" : "Fastprisavtaler"}
            description={`Estimert månedlig kostnad basert på ${consumption} kWh årsforbruk`}
            items={selectedType === 'spot' ? spotPriceProviders : fixedPriceProviders}
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
  );
};
