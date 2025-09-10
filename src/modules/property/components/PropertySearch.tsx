import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Property } from '../types/propertyTypes';
import { Search, Filter, X } from 'lucide-react';

interface PropertySearchProps {
  properties: Property[];
  onFilteredPropertiesChange: (filtered: Property[]) => void;
}

interface Filters {
  search: string;
  type: string;
  sizeRange: string;
  hasAddress: boolean | null;
}

export function PropertySearch({ properties, onFilteredPropertiesChange }: PropertySearchProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: '',
    sizeRange: '',
    hasAddress: null
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredProperties = useMemo(() => {
    let result = properties;

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(property => 
        property.name.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.type.toLowerCase().includes(searchLower)
      );
    }

    // Property type
    if (filters.type) {
      result = result.filter(property => property.type === filters.type);
    }

    // Size range
    if (filters.sizeRange) {
      result = result.filter(property => {
        if (!property.size) return false;
        switch (filters.sizeRange) {
          case 'small': return property.size < 100;
          case 'medium': return property.size >= 100 && property.size < 200;
          case 'large': return property.size >= 200;
          default: return true;
        }
      });
    }

    // Has address
    if (filters.hasAddress !== null) {
      result = result.filter(property => 
        filters.hasAddress ? !!property.address : !property.address
      );
    }

    return result;
  }, [properties, filters]);

  React.useEffect(() => {
    onFilteredPropertiesChange(filteredProperties);
  }, [filteredProperties, onFilteredPropertiesChange]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      sizeRange: '',
      hasAddress: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null);

  const propertyTypes = Array.from(new Set(properties.map(p => p.type)));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter eiendomsnavn, adresse eller type..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Avanserte filtre
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Nullstill filtre
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Eiendomstype</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle typer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle typer</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Størrelse</label>
                <Select value={filters.sizeRange} onValueChange={(value) => handleFilterChange('sizeRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle størrelser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle størrelser</SelectItem>
                    <SelectItem value="small">Under 100 m²</SelectItem>
                    <SelectItem value="medium">100-200 m²</SelectItem>
                    <SelectItem value="large">Over 200 m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Adresse</label>
                <Select 
                  value={filters.hasAddress === null ? '' : filters.hasAddress.toString()} 
                  onValueChange={(value) => handleFilterChange('hasAddress', value === '' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    <SelectItem value="true">Med adresse</SelectItem>
                    <SelectItem value="false">Uten adresse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Søk: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')} 
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filters.type}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('type', '')} 
                  />
                </Badge>
              )}
              {filters.sizeRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Størrelse: {
                    filters.sizeRange === 'small' ? 'Under 100 m²' :
                    filters.sizeRange === 'medium' ? '100-200 m²' :
                    'Over 200 m²'
                  }
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('sizeRange', '')} 
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Viser {filteredProperties.length} av {properties.length} eiendommer
          </div>
        </div>
      </CardContent>
    </Card>
  );
}