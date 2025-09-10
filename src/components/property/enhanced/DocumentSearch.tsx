import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { DocumentGrid } from './DocumentGrid';

interface DocumentSearchProps {
  propertyId: string;
  onFiltersChange: (filters: any) => void;
}

export const DocumentSearch = ({ propertyId, onFiltersChange }: DocumentSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => enhancedPropertyDocumentService.getDocumentCategories(),
  });

  // Fetch filtered documents
  const filters = {
    query: searchQuery,
    category_id: selectedCategory,
    tags: activeTags,
    date_range: (dateRange.from && dateRange.to) ? dateRange : undefined,
  };

  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ['search-property-documents', propertyId, filters],
    queryFn: () => enhancedPropertyDocumentService.searchDocuments(propertyId, filters),
    enabled: !!propertyId,
  });

  // Update parent component with filters
  useEffect(() => {
    onFiltersChange(filters);
  }, [searchQuery, selectedCategory, activeTags, dateRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setDateRange({ from: '', to: '' });
    setActiveTags([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || activeTags.length > 0 || (dateRange.from && dateRange.to);

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Søk og filtrér dokumenter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Query */}
          <div>
            <Label htmlFor="search">Søk i navn og beskrivelse</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter dokumenter..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Filter */}
            <div>
              <Label>Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle kategorier</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Datoperiode</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="Fra"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="Til"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Aktive filtre:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Søk: "{searchQuery}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {selectedCategory && (
                  <Badge variant="secondary" className="text-xs">
                    Kategori: {categories.find(c => c.id === selectedCategory)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => setSelectedCategory('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {(dateRange.from && dateRange.to) && (
                  <Badge variant="secondary" className="text-xs">
                    Periode: {dateRange.from} - {dateRange.to}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => setDateRange({ from: '', to: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
              
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Fjern alle filtre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Søkeresultater ({searchResults.length} dokumenter)
          </h3>
        </div>
        
        <DocumentGrid 
          documents={searchResults}
          isLoading={isLoading}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
};