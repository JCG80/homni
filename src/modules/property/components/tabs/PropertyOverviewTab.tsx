
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property, PropertyExpense } from '../../types/propertyTypes';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../utils/propertyUtils';

interface PropertyOverviewTabProps {
  property: Property;
  expenses: PropertyExpense[];
  documentsCount: number;
}

export const PropertyOverviewTab: React.FC<PropertyOverviewTabProps> = ({ 
  property, 
  expenses, 
  documentsCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Eiendomsinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd className="mt-1">{getPropertyTypeLabel(property.type)}</dd>
            </div>
            
            {property.size && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Størrelse</dt>
                <dd className="mt-1">{property.size} m²</dd>
              </div>
            )}
            
            {property.address && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Adresse</dt>
                <dd className="mt-1">{property.address}</dd>
              </div>
            )}
            
            {property.purchase_date && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Kjøpsdato</dt>
                <dd className="mt-1">{formatDate(property.purchase_date)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sammendrag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Totale utgifter</p>
              <p className="text-2xl font-bold">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dokumenter</p>
              <p className="text-2xl font-bold">{documentsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
