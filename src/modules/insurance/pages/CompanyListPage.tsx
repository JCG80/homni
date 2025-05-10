
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsuranceCompanies } from '../hooks/useInsuranceQueries';
import { InsuranceCompanyCard } from '../components/InsuranceCompanyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Search, Filter, SlidersHorizontal } from 'lucide-react';

export const CompanyListPage = () => {
  const { data: companies = [], isLoading } = useInsuranceCompanies();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const filteredCompanies = companies
    .filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!showFeaturedOnly || company.is_featured)
    )
    .sort((a, b) => {
      // Sort by featured first, then by rating
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (b.customer_rating || 0) - (a.customer_rating || 0);
    });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Building className="h-8 w-8 mr-2 text-primary" />
          Forsikringsselskaper
        </h1>
        <p className="text-muted-foreground">
          Utforsk og sammenlign forsikringsselskaper for å finne den beste løsningen for deg
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk forsikringsselskaper..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant={showFeaturedOnly ? "default" : "outline"}
          className={showFeaturedOnly ? "" : "border-dashed"}
          onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFeaturedOnly ? 'Vis alle' : 'Vis anbefalte'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <SlidersHorizontal className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ingen selskaper funnet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Vi fant ingen forsikringsselskaper som matcher dine søkekriterier. 
              Prøv å endre søkeordene eller fjern filtre.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map(company => (
            <InsuranceCompanyCard 
              key={company.id} 
              company={company} 
              onClick={() => navigate(`/insurance/companies/${company.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
