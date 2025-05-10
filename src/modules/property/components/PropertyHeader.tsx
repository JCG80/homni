
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, House, Calendar } from 'lucide-react';
import { Property } from '../types/propertyTypes';
import { formatDate } from '../utils/propertyUtils';

interface PropertyHeaderProps {
  property: Property;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({ property }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/properties')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbake til oversikten
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <House className="h-5 w-5 mr-2" />
            <h1 className="text-2xl font-bold">{property.name}</h1>
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
    </>
  );
};

// Import utility function from the other file
import { getPropertyTypeLabel } from '../utils/propertyUtils';
