
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatus, LEAD_STATUSES } from '../types/types';
import { LEAD_CATEGORIES } from '../constants/lead-constants';

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

  return (
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
    </div>
  );
};
