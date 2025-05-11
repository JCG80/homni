
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LeadStatus } from '../types/types';
import { useUserFilters } from '../hooks/useUserFilters';
import { FilterSelectors } from './filters/FilterSelectors';
import { SaveFilterDialog } from './filters/SaveFilterDialog';
import { SavedFilters } from './filters/SavedFilters';
import { AlertCircle } from 'lucide-react';

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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    filters,
    activeFilter,
    isLoading,
    error,
    canManageFilters,
    createFilter,
    updateFilter,
    setActiveFilter,
    loadUserFilters
  } = useUserFilters();

  // Load filter when activeFilter changes
  useEffect(() => {
    if (activeFilter && activeFilter.filter_data) {
      const { status, category } = activeFilter.filter_data;
      
      if (status) {
        setStatusFilter(status as LeadStatus);
        onStatusFilterChange(status as LeadStatus);
      } else {
        setStatusFilter(undefined);
        onStatusFilterChange(undefined);
      }
      
      if (category) {
        setCategoryFilter(category);
        onCategoryFilterChange(category);
      } else {
        setCategoryFilter(undefined);
        onCategoryFilterChange(undefined);
      }
    }
  }, [activeFilter, onStatusFilterChange, onCategoryFilterChange]);
  
  // Handler for status filter changes
  const handleStatusChange = (newStatus: LeadStatus | undefined) => {
    setStatusFilter(newStatus);
    onStatusFilterChange(newStatus);
  };
  
  // Handler for category filter changes
  const handleCategoryChange = (newCategory: string | undefined) => {
    setCategoryFilter(newCategory);
    onCategoryFilterChange(newCategory);
  };
  
  // Save current filter
  const handleSaveFilter = async (filterName: string, asDefault: boolean) => {
    // Create filter data from current selections
    const filterData = {
      status: statusFilter,
      category: categoryFilter
    };
    
    try {
      if (activeFilter) {
        // Update existing filter
        await updateFilter(activeFilter.id, {
          filter_name: filterName || activeFilter.filter_name,
          filter_data: filterData,
          is_default: asDefault
        });
      } else {
        // Create new filter
        await createFilter({
          filter_name: filterName || 'Unnamed filter',
          filter_data: filterData,
          is_default: asDefault
        });
      }
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };
  
  // Apply saved filter
  const handleApplyFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Create a new filter
  const handleCreateNewFilter = () => {
    // Clear the active filter so we can create a new one
    setActiveFilter(null);
    
    // Open the dialog to create a new filter
    setIsDialogOpen(true);
  };

  // Retry loading filters if there was an error
  const handleRetryLoad = () => {
    loadUserFilters();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 p-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} className="text-destructive" />
          <span className="text-sm">{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetryLoad}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Filter Selectors Component */}
        <FilterSelectors
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onStatusFilterChange={handleStatusChange}
          onCategoryFilterChange={handleCategoryChange}
        />
        
        {/* Save Filter Dialog - only visible if user has permission */}
        {canManageFilters && (
          <div>
            <SaveFilterDialog
              activeFilter={activeFilter}
              isLoading={isLoading}
              onSaveFilter={handleSaveFilter}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div>
        )}
      </div>
      
      {/* Saved Filters Component */}
      <SavedFilters
        filters={filters}
        activeFilter={activeFilter}
        onApplyFilter={handleApplyFilter}
        onCreateNewFilter={handleCreateNewFilter}
        canManageFilters={canManageFilters}
      />
    </div>
  );
};
