
import React, { useState } from 'react';
import { InsuranceCompanyCard } from '../components/InsuranceCompanyCard';
import { InsuranceTypeTag } from '../components/InsuranceTypeTag';
import { useInsuranceQueries } from '../hooks/useInsuranceQueries';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export const InsuranceComparisonPage = () => {
  const { data: companies = [], isLoading } = useInsuranceQueries.useInsuranceCompanies();
  const { data: types = [] } = useInsuranceQueries.useInsuranceTypes();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Filter companies by type and search term
  const filteredCompanies = companies.filter(company => {
    const matchesType = !filterType || 
      (company.insurance_types && 
       company.insurance_types.some(type => type.id === filterType));
    
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleCompanyClick = (companyId: string) => {
    navigate(`/insurance/companies/${companyId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sammenlign forsikringsselskaper</h1>
        <p className="text-muted-foreground">
          Finn de beste forsikringsselskapene basert på kundetilfredshet og anmeldelser
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-card rounded-lg border p-4 sticky top-24">
            <h3 className="font-medium mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Filtrer selskaper
            </h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Forsikringstype</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 rounded-full text-xs ${!filterType ? 'bg-primary text-white' : 'bg-secondary'}`}
                  onClick={() => setFilterType(null)}
                >
                  Alle
                </button>
                {types.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFilterType(type.id === filterType ? null : type.id)}
                    className={`px-3 py-1 rounded-full text-xs 
                      ${type.id === filterType ? 'bg-primary text-white' : 'bg-secondary'}`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Kundevurdering</h4>
              <div className="space-y-2">
                {[5, 4, 3].map(rating => (
                  <div key={rating} className="flex items-center">
                    <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
                    <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                      {Array(rating).fill(0).map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                      {Array(5-rating).fill(0).map((_, i) => (
                        <span key={i} className="text-gray-300">★</span>
                      ))}
                      <span className="ml-1">og høyere</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Anbefalte selskaper</h4>
              <div className="flex items-center">
                <input type="checkbox" id="featured" className="mr-2" />
                <label htmlFor="featured" className="text-sm">Kun anbefalte selskaper</label>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-6 flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Tilbakestill filter
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          {/* Search and sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Søk etter forsikringsselskap..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="rating" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="rating">Kundetilfredshet</TabsTrigger>
                <TabsTrigger value="reviews">Antall omtaler</TabsTrigger>
                <TabsTrigger value="name">Navn</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Viser {filteredCompanies.length} av {companies.length} forsikringsselskaper
          </p>
          
          {/* Company grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border">
                  <p className="text-lg mb-4">Ingen forsikringsselskaper funnet</p>
                  <p className="text-muted-foreground">
                    Prøv å justere filteret eller søket ditt
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilterType(null);
                      setSearchTerm('');
                    }}
                  >
                    Tilbakestill søk
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map((company) => (
                    <InsuranceCompanyCard 
                      key={company.id} 
                      company={company}
                      onClick={() => handleCompanyClick(company.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* CTA for quotes */}
          <div className="bg-primary/10 rounded-lg p-6 mt-12 text-center">
            <h3 className="text-xl font-bold mb-2">Sammenlign tilbud fra flere selskaper</h3>
            <p className="mb-4">Få personlige tilbud fra flere forsikringsselskaper samtidig</p>
            <Button onClick={() => navigate('/insurance/quote')}>
              Få forsikringstilbud nå
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
