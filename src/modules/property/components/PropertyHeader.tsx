
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, House, Calendar } from 'lucide-react';
import { Property } from '../types/propertyTypes';
import { formatDate, getPropertyTypeLabel } from '../utils/propertyUtils';

interface PropertyHeaderProps {
  property: Property;
  showBackButton?: boolean;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({ 
  property, 
  showBackButton = true 
}) => {
  return (
    <div className="mb-6">
      {showBackButton && (
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center">
            <House className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">{property.name}</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            {property.address || 'Ingen adresse registrert'} • {getPropertyTypeLabel(property.type)}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center text-muted-foreground text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Registrert: {formatDate(property.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
