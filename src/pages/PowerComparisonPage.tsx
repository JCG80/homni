import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { PowerComparisonHeader } from '@/components/power/PowerComparisonHeader';
import { PowerComparisonFooter } from '@/components/power/PowerComparisonFooter';
import { PowerComparisonForm } from '@/components/power/PowerComparisonForm';
import { PowerComparisonResults } from '@/components/power/PowerComparisonResults';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';

export const PowerComparisonPage = () => {
  const [postnr, setPostnr] = useState('');
  const [consumption, setConsumption] = useState(16000);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState('spot');
  const isMobile = useIsMobile();

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
        <div className="container mx-auto py-6 md:py-8 px-4">
          <PageBreadcrumb 
            items={[{ label: 'Strømsammenligning' }]} 
            className="mb-6" 
          />
          
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Sammenlign strømpriser</h1>
            <p className="text-muted-foreground mt-2">
              Finn den beste strømavtalen for din bolig
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Search Form - Shown at top on mobile if no results */}
            <div className={`${isMobile && showResults ? 'hidden' : 'block'} lg:col-span-1`}>
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
            <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'}`}>
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