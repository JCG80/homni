
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LeadStatus, LEAD_STATUSES } from '../types/types';
import { LEAD_CATEGORIES } from '../constants/lead-constants';
import { useUserFilters } from '../hooks/useUserFilters';
import { UserLeadFilter } from '../types/user-filters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Filter, Plus, Check, X } from 'lucide-react';

interface LeadsFilterBarProps {
  initialStatusFilter?: LeadStatus;
  initialCategoryFilter?: string;
  onStatusFilterChange: (status: LeadStatus | undefined) => void;
  onCategoryFilterChange: (category: string | undefined) => void;
}

export const LeadsFilterBar = ({
  initialStatusFilter,
  initialCategoryFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
}: LeadsFilterBarProps) => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(
    initialStatusFilter
  );
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    initialCategoryFilter
  );
  const [filterName, setFilterName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const {
    filters,
    activeFilter,
    isLoading,
    createFilter,
    updateFilter,
    setActiveFilter
  } = useUserFilters();

  const handleStatusChange = (value: string) => {
    const newStatus = value === '' ? undefined : (value as LeadStatus);
    setStatusFilter(newStatus);
    onStatusFilterChange(newStatus);
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = value === '' ? undefined : value;
    setCategoryFilter(newCategory);
    onCategoryFilterChange(newCategory);
  };
  
  // Load filter when activeFilter changes
  useEffect(() => {
    if (activeFilter && activeFilter.filter_data) {
      const { status, category } = activeFilter.filter_data;
      
      if (status) {
        setStatusFilter(status as LeadStatus);
        onStatusFilterChange(status as LeadStatus);
      }
      
      if (category) {
        setCategoryFilter(category);
        onCategoryFilterChange(category);
      }
    }
  }, [activeFilter, onStatusFilterChange, onCategoryFilterChange]);
  
  // Save current filter
  const handleSaveFilter = async () => {
    // Create filter data from current selections
    const filterData = {
      status: statusFilter,
      category: categoryFilter
    };
    
    if (activeFilter) {
      // Update existing filter
      await updateFilter(activeFilter.id, {
        filter_name: filterName || activeFilter.filter_name,
        filter_data: filterData,
        is_default: saveAsDefault
      });
    } else {
      // Create new filter
      await createFilter({
        filter_name: filterName || 'Unnamed filter',
        filter_data: filterData,
        is_default: saveAsDefault
      });
    }
    
    setIsSaveDialogOpen(false);
  };
  
  // Apply saved filter
  const handleApplyFilter = (filter: UserLeadFilter) => {
    setActiveFilter(filter.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <Select
            value={statusFilter || ''}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter på status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle statuser</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/3">
          <Select
            value={categoryFilter || ''}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter på kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle kategorier</SelectItem>
              {LEAD_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Save size={16} />
                <span>Lagre filter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lagre filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-name">Filternavn</Label>
                  <Input
                    id="filter-name"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder={activeFilter?.filter_name || 'Mitt filter'}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="default-filter"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="default-filter">Sett som standardfilter</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleSaveFilter} disabled={isLoading}>
                  Lagre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-sm text-muted-foreground flex items-center">
            <Filter size={14} className="mr-1" /> Lagrede filtre:
          </span>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              size="sm"
              variant={activeFilter?.id === filter.id ? "default" : "outline"}
              className="flex items-center gap-1"
              onClick={() => handleApplyFilter(filter)}
            >
              {filter.filter_name || 'Unnamed'}
              {filter.is_default && (
                <Check size={14} className="ml-1 text-green-500" />
              )}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => {
              setFilterName('');
              setSaveAsDefault(false);
              setIsSaveDialogOpen(true);
            }}
          >
            <Plus size={14} />
            Ny
          </Button>
        </div>
      )}
    </div>
  );
};
