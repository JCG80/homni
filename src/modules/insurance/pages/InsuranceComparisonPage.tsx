
import React, { useState, useMemo } from 'react';
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';
import { useNavigate } from 'react-router-dom';
import { FilterSidebar } from '../components/comparison/FilterSidebar';
import { SearchAndSort } from '../components/comparison/SearchAndSort';
import { InsuranceCompanyGrid } from '../components/comparison/InsuranceCompanyGrid';
import { InsuranceQuoteCTA } from '../components/comparison/InsuranceQuoteCTA';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';
import { InsuranceCompanyWithTypes } from '../types/insurance-types';

export const InsuranceComparisonPage = () => {
  const { data: companies = [], isLoading } = useInsuranceQueries.useInsuranceCompaniesWithTypes();
  const { data: types = [] } = useInsuranceQueries.useInsuranceTypes();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Filter and sort companies
  const processedCompanies = useMemo(() => {
    let result = [...companies];
    
    // Apply type filter
    if (filterType) {
      result = result.filter(company => 
        company.insurance_types && 
        company.insurance_types.some(type => type.id === filterType)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(company => 
        company.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          // Sort by rating (highest first)
          return (b.customer_rating || 0) - (a.customer_rating || 0);
        case 'reviews':
          // Sort by number of reviews (highest first)
          return (b.review_count || 0) - (a.review_count || 0);
        case 'name':
          // Sort alphabetically by name
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return result;
  }, [companies, filterType, searchTerm, sortBy]);

  const handleCompanyClick = (companyId: string) => {
    navigate(`/insurance/companies/${companyId}`);
  };

  const resetFilters = () => {
    setFilterType(null);
    setSearchTerm('');
    setSortBy('rating');
  };

  return (
    <PageLayout
      title="Sammenlign forsikringsselskaper"
      description="Finn de beste forsikringsselskapene basert på kundetilfredshet og anmeldelser"
    >
      <div className="flex flex-col gap-6">
        {/* Mobile filter toggle */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center w-full mb-2">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> 
                Filter og søk
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
              <div className="p-4 h-full overflow-auto">
                <h2 className="font-medium mb-4">Filter og søk</h2>
                <div className="mb-4">
                  <SearchAndSort 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>
                <FilterSidebar 
                  types={types} 
                  filterType={filterType}
                  setFilterType={setFilterType}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar - desktop only */}
          {!isMobile && (
            <div className="w-full md:w-64 shrink-0">
              <FilterSidebar 
                types={types} 
                filterType={filterType}
                setFilterType={setFilterType}
              />
            </div>
          )}
          
          {/* Main content */}
          <div className="flex-1">
            {/* Search and sort - desktop only */}
            {!isMobile && (
              <SearchAndSort 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            )}
            
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              Viser {processedCompanies.length} av {companies.length} forsikringsselskaper
            </p>
            
            <InsuranceCompanyGrid 
              companies={processedCompanies}
              isLoading={isLoading}
              handleCompanyClick={handleCompanyClick}
              resetFilters={resetFilters}
            />
            
            {/* CTA for quotes */}
            <InsuranceQuoteCTA />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
