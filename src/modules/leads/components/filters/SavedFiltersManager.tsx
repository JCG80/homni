import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Save, Star, Trash2, MoreVertical, Filter } from 'lucide-react';
import { useUserFilters } from '../../hooks/useUserFilters';
import { UserLeadFilter } from '../../types/user-filters';
import { toast } from '@/hooks/use-toast';

interface SavedFiltersManagerProps {
  currentFilters: any;
  onLoadFilter: (filter: UserLeadFilter) => void;
}

export const SavedFiltersManager: React.FC<SavedFiltersManagerProps> = ({
  currentFilters,
  onLoadFilter
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const {
    filters,
    activeFilter,
    isLoading,
    canManageFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter
  } = useUserFilters();

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      toast({
        title: 'Navn kreves',
        description: 'Vennligst oppgi et navn for filteret',
        variant: 'destructive'
      });
      return;
    }

    const success = await createFilter({
      filter_name: filterName,
      filter_data: {
        search: currentFilters.search,
        status: currentFilters.status,
        category: currentFilters.category,
        dateRange: currentFilters.dateRange
      },
      is_default: isDefault
    });

    if (success) {
      setSaveDialogOpen(false);
      setFilterName('');
      setIsDefault(false);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    const success = await deleteFilter(filterId);
    if (success) {
      toast({
        title: 'Filter slettet',
        description: 'Filteret har blitt fjernet',
      });
    }
  };

  const handleSetDefault = async (filterId: string) => {
    try {
      const filter = filters.find(f => f.id === filterId);
      if (filter) {
        await updateFilter(filterId, { is_default: true });
        toast({
          title: 'Standardfilter oppdatert',
          description: 'Dette filteret vil nå lastes som standard',
        });
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke sette standardfilter',
        variant: 'destructive'
      });
    }
  };

  if (!canManageFilters) {
    return null;
  }

  const hasActiveFilters = currentFilters.search || 
    currentFilters.status !== 'all' || 
    currentFilters.category !== 'all' || 
    currentFilters.dateRange !== 'all';

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lagrede filtre
          </CardTitle>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={!hasActiveFilters}
              >
                <Save className="h-4 w-4 mr-2" />
                Lagre filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lagre filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Navn på filter</label>
                  <Input
                    placeholder="F.eks. Aktive leads denne måneden"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <label htmlFor="default" className="text-sm">
                    Bruk som standardfilter
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleSaveFilter}>
                    Lagre
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Laster filtre...</span>
          </div>
        ) : filters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ingen lagrede filtre. Lagre dine første filtre for rask tilgang.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className={`p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors ${
                  activeFilter?.id === filter.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => {
                  onLoadFilter(filter);
                  setActiveFilter(filter.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {filter.is_default && (
                      <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {filter.filter_name || 'Unnløst filter'}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSetDefault(filter.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        Sett som standard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Slett
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {filter.filter_data.search && (
                    <Badge variant="secondary" className="text-xs">
                      Søk
                    </Badge>
                  )}
                  {filter.filter_data.status && filter.filter_data.status !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Status
                    </Badge>
                  )}
                  {filter.filter_data.category && filter.filter_data.category !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Kategori
                    </Badge>
                  )}
                  {filter.filter_data.dateRange && (typeof filter.filter_data.dateRange === 'string' ? filter.filter_data.dateRange !== 'all' : true) && (
                    <Badge variant="secondary" className="text-xs">
                      Dato
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};