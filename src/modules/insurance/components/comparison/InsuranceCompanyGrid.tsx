
import React from 'react';
import { InsuranceCompanyCard } from '../../components/InsuranceCompanyCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InsuranceCompanyWithTypes } from '../../types/insurance-types';
import { useIsMobile } from '@/hooks/use-mobile';

interface InsuranceCompanyGridProps {
  companies: InsuranceCompanyWithTypes[];
  isLoading: boolean;
  handleCompanyClick: (companyId: string) => void;
  resetFilters: () => void;
}

export const InsuranceCompanyGrid: React.FC<InsuranceCompanyGridProps> = ({ 
  companies, 
  isLoading, 
  handleCompanyClick,
  resetFilters
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(isMobile ? 3 : 6)].map((_, i) => (
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
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <p className="text-lg mb-4">Ingen forsikringsselskaper funnet</p>
        <p className="text-muted-foreground">
          Prøv å justere filteret eller søket ditt
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={resetFilters}
        >
          Tilbakestill søk
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <InsuranceCompanyCard 
          key={company.id} 
          company={company}
          onClick={() => handleCompanyClick(company.id)}
        />
      ))}
    </div>
  );
};
