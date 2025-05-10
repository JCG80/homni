
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
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
  );
};
