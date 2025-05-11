
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { PowerComparisonHeader } from '@/components/power/PowerComparisonHeader';
import { PowerComparisonFooter } from '@/components/power/PowerComparisonFooter';
import { PowerComparisonForm } from '@/components/power/PowerComparisonForm';
import { PowerComparisonResults } from '@/components/power/PowerComparisonResults';

export const PowerComparisonPage = () => {
  const [postnr, setPostnr] = useState('');
  const [consumption, setConsumption] = useState(16000);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState('spot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postnr || postnr.length !== 4 || !/^\d+$/.test(postnr)) {
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
    const providerName = id.split('-')[0];
    const providerType = id.split('-')[1];
    
    toast({
      title: "Strømleverandør valgt",
      description: `Du har valgt ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} med ${providerType === 'spot' ? 'spotprisavtale' : 'fastprisavtale'}. En representant vil kontakte deg snart.`,
    });
  };

  const resetSearch = () => {
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PowerComparisonHeader />

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
              <PowerComparisonForm
                postnr={postnr}
                setPostnr={setPostnr}
                consumption={consumption}
                setConsumption={setConsumption}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                handleSubmit={handleSubmit}
              />
            </div>
            
            {/* Results */}
            <div className="lg:col-span-2">
              <PowerComparisonResults 
                showResults={showResults}
                postnr={postnr}
                consumption={consumption}
                selectedType={selectedType}
                handleSelect={handleSelect}
                resetSearch={resetSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <PowerComparisonFooter />
    </div>
  );
};
