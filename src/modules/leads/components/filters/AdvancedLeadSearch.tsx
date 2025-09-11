import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Calendar as CalendarIcon, Tag, User, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { LeadStatus, STATUS_LABELS } from '@/types/leads-canonical';
import { LEAD_CATEGORIES } from '../../constants/lead-constants';
import { SavedFiltersManager } from './SavedFiltersManager';

interface AdvancedFilters {
  search: string;
  status: LeadStatus | 'all';
  category: string | 'all';
  dateRange: '7days' | '30days' | '90days' | 'custom' | 'all';
  customDateStart?: Date;
  customDateEnd?: Date;
  location?: string;
  minValue?: number;
  maxValue?: number;
  assignedTo?: string | 'all';
  source?: string | 'all';
}

interface AdvancedLeadSearchProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
  suggestions?: string[];
}

export const AdvancedLeadSearch: React.FC<AdvancedLeadSearchProps> = ({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  filteredCount,
  suggestions = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.search || 
      filters.status !== 'all' || 
      filters.category !== 'all' || 
      filters.dateRange !== 'all' ||
      filters.location ||
      filters.minValue ||
      filters.maxValue ||
      (filters.assignedTo && filters.assignedTo !== 'all') ||
      (filters.source && filters.source !== 'all');
  }, [filters]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.location) count++;
    if (filters.minValue || filters.maxValue) count++;
    if (filters.assignedTo && filters.assignedTo !== 'all') count++;
    if (filters.source && filters.source !== 'all') count++;
    return count;
  };

  const filteredSuggestions = useMemo(() => {
    if (!filters.search || !showSuggestions) return [];
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(filters.search.toLowerCase())
    ).slice(0, 5);
  }, [filters.search, suggestions, showSuggestions]);

  const handleLoadFilter = (filter: any) => {
    onFiltersChange({
      search: filter.filter_data.search || '',
      status: filter.filter_data.status || 'all',
      category: filter.filter_data.category || 'all',
      dateRange: filter.filter_data.dateRange || 'all',
      location: filter.filter_data.location || '',
      minValue: filter.filter_data.minValue,
      maxValue: filter.filter_data.maxValue,
      assignedTo: filter.filter_data.assignedTo || 'all',
      source: filter.filter_data.source || 'all'
    });
  };

  return (
    <div className="space-y-4">
      <SavedFiltersManager 
        currentFilters={filters}
        onLoadFilter={handleLoadFilter}
      />
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk i leads (navn, e-post, beskrivelse, telefon...)"
                  value={filters.search}
                  onChange={(e) => {
                    handleFilterChange('search', e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(filters.search.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                
                {/* Search Suggestions */}
                {filteredSuggestions.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 z-10 mt-1 border shadow-lg">
                    <CardContent className="p-2">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-muted cursor-pointer rounded text-sm"
                          onClick={() => {
                            handleFilterChange('search', suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={isExpanded ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="whitespace-nowrap"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Avansert filter
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Nullstill
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Advanced Filters */}
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Status
                  </label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle statuser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statuser</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Kategori
                  </label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle kategorier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle kategorier</SelectItem>
                      {LEAD_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Tidsperiode
                  </label>
                  <Select 
                    value={filters.dateRange} 
                    onValueChange={(value) => handleFilterChange('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle datoer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle datoer</SelectItem>
                      <SelectItem value="7days">Siste 7 dager</SelectItem>
                      <SelectItem value="30days">Siste 30 dager</SelectItem>
                      <SelectItem value="90days">Siste 90 dager</SelectItem>
                      <SelectItem value="custom">Egendefinert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lokasjon
                  </label>
                  <Input
                    placeholder="Postnummer eller sted"
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                {/* Custom Date Range */}
                {filters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2">Fra dato</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.customDateStart ? 
                              format(filters.customDateStart, 'dd.MM.yyyy', { locale: nb }) : 
                              'Velg dato'
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.customDateStart}
                            onSelect={(date) => handleFilterChange('customDateStart', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2">Til dato</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.customDateEnd ? 
                              format(filters.customDateEnd, 'dd.MM.yyyy', { locale: nb }) : 
                              'Velg dato'
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.customDateEnd}
                            onSelect={(date) => handleFilterChange('customDateEnd', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Min verdi (kr)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minValue || ''}
                    onChange={(e) => handleFilterChange('minValue', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Max verdi (kr)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ubegrenset"
                    value={filters.maxValue || ''}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            )}

            {/* Results Summary and Active Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Viser <strong>{filteredCount}</strong> av <strong>{totalCount}</strong> leads
              </span>
              
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1">
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs">
                      Søk: "{filters.search}"
                    </Badge>
                  )}
                  {filters.status !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {STATUS_LABELS[filters.status as LeadStatus]}
                    </Badge>
                  )}
                  {filters.category !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Kategori: {filters.category}
                    </Badge>
                  )}
                  {filters.dateRange !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.dateRange === 'custom' 
                        ? `${filters.customDateStart ? format(filters.customDateStart, 'dd.MM', { locale: nb }) : ''} - ${filters.customDateEnd ? format(filters.customDateEnd, 'dd.MM', { locale: nb }) : ''}`
                        : filters.dateRange === '7days' ? 'Siste 7 dager' : 
                          filters.dateRange === '30days' ? 'Siste 30 dager' : 
                          'Siste 90 dager'
                      }
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="secondary" className="text-xs">
                      Lokasjon: {filters.location}
                    </Badge>
                  )}
                  {(filters.minValue || filters.maxValue) && (
                    <Badge variant="secondary" className="text-xs">
                      Verdi: {filters.minValue || 0} - {filters.maxValue || '∞'} kr
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};