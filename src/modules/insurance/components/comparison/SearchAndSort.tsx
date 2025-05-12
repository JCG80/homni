
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} gap-4 mb-6`}>
      <div className="relative grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Søk etter forsikringsselskap..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="rating" className="w-full">
        <TabsList className={isMobile ? 'w-full' : undefined}>
          <TabsTrigger value="rating" className={isMobile ? 'flex-1' : undefined}>Kundetilfredshet</TabsTrigger>
          <TabsTrigger value="reviews" className={isMobile ? 'flex-1' : undefined}>Antall omtaler</TabsTrigger>
          <TabsTrigger value="name" className={isMobile ? 'flex-1' : undefined}>Navn</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
