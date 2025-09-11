import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, Calendar, Tag, User } from 'lucide-react';
import { LeadStatus, STATUS_LABELS } from '@/types/leads-canonical';
import { LEAD_CATEGORIES } from '../constants/lead-constants';

interface LeadFilters {
  search: string;
  status: LeadStatus | 'all';
  category: string | 'all';
  dateRange: '7days' | '30days' | '90days' | 'all';
}

interface LeadSearchFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export const LeadSearchFilters: React.FC<LeadSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.dateRange !== 'all';

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk i leads (navn, e-post, beskrivelse...)"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={isExpanded ? "default" : "outline"}
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
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

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
                  <Calendar className="h-4 w-4" />
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results Summary */}
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
                    Periode: {filters.dateRange === '7days' ? 'Siste 7 dager' : 
                             filters.dateRange === '30days' ? 'Siste 30 dager' : 
                             'Siste 90 dager'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};