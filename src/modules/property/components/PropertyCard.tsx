import React from 'react';
import { MapPin, Calendar, TrendingUp, Settings, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property, PropertyType } from '../types/propertyTypes';

export interface PropertyCardProps {
  property: Property;
}

const getPropertyTypeLabel = (type: PropertyType): string => {
  switch (type) {
    case 'apartment': return 'Leilighet';
    case 'house': return 'Enebolig';
    case 'townhouse': return 'Rekkehus';
    case 'cabin': return 'Hytte';
    case 'commercial': return 'Næringseiendom';
    case 'land': return 'Tomt';
    default: return type;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const currentValue = property.current_value || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{property.name}</h3>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address || 'Ingen adresse'}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{getPropertyTypeLabel(property.type)}</p>
          </div>
          {property.size && (
            <div>
              <p className="text-muted-foreground">Størrelse</p>
              <p className="font-medium">{property.size} m²</p>
            </div>
          )}
        </div>

        {/* Value Information */}
        {currentValue > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimert verdi</p>
                <p className="text-lg font-semibold">{formatCurrency(currentValue)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Information */}
        {property.purchase_date && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Kjøpt {new Date(property.purchase_date).toLocaleDateString('nb-NO')}
            </span>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};