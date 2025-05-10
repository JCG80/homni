
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { InsuranceType } from '../../types/insurance-types';

interface FilterSidebarProps {
  types: InsuranceType[];
  filterType: string | null;
  setFilterType: (type: string | null) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  types, 
  filterType, 
  setFilterType 
}) => {
  return (
    <div className="bg-card rounded-lg border p-4 sticky top-24">
      <h3 className="font-medium mb-4 flex items-center">
        <Filter className="h-4 w-4 mr-2" /> Filtrer selskaper
      </h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Forsikringstype</h4>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded-full text-xs ${!filterType ? 'bg-primary text-white' : 'bg-secondary'}`}
            onClick={() => setFilterType(null)}
          >
            Alle
          </button>
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id === filterType ? null : type.id)}
              className={`px-3 py-1 rounded-full text-xs 
                ${type.id === filterType ? 'bg-primary text-white' : 'bg-secondary'}`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Kundevurdering</h4>
        <div className="space-y-2">
          {[5, 4, 3].map(rating => (
            <div key={rating} className="flex items-center">
              <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
              <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                {Array(rating).fill(0).map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
                {Array(5-rating).fill(0).map((_, i) => (
                  <span key={i} className="text-gray-300">★</span>
                ))}
                <span className="ml-1">og høyere</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Anbefalte selskaper</h4>
        <div className="flex items-center">
          <input type="checkbox" id="featured" className="mr-2" />
          <label htmlFor="featured" className="text-sm">Kun anbefalte selskaper</label>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-6 flex items-center"
        onClick={() => setFilterType(null)}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" /> Tilbakestill filter
      </Button>
    </div>
  );
};
