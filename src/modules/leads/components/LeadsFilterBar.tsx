
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LeadStatus } from '../types/types';
import { useUserFilters } from '../hooks/useUserFilters';
import { FilterSelectors } from './filters/FilterSelectors';
import { SaveFilterDialog } from './filters/SaveFilterDialog';
import { SavedFilters } from './filters/SavedFilters';

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
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const {
    filters,
    activeFilter,
    isLoading,
    createFilter,
    updateFilter,
    setActiveFilter
  } = useUserFilters();

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
  };
  
  // Apply saved filter
  const handleApplyFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Open save dialog for new filter
  const handleCreateNewFilter = () => {
    setIsSaveDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Filter Selectors Component */}
        <FilterSelectors
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onStatusFilterChange={handleStatusChange}
          onCategoryFilterChange={handleCategoryChange}
        />
        
        {/* Save Filter Dialog */}
        <div>
          <SaveFilterDialog
            activeFilter={activeFilter}
            isLoading={isLoading}
            onSaveFilter={handleSaveFilter}
          />
        </div>
      </div>
      
      {/* Saved Filters Component */}
      <SavedFilters
        filters={filters}
        activeFilter={activeFilter}
        onApplyFilter={handleApplyFilter}
        onCreateNewFilter={handleCreateNewFilter}
      />
    </div>
  );
};
