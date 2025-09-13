import React from 'react';
import { useProperties } from '../hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';

export const MyPropertiesWidget: React.FC = () => {
  const { properties, isLoading, error } = useProperties();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Laster eiendommer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Kunne ikke laste eiendommer</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Prøv igjen
        </Button>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Home className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">Ingen eiendommer ennå</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Legg til din første eiendom for å komme i gang
        </p>
        <Button onClick={() => navigate('/properties/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Legg til eiendom
        </Button>
      </div>
    );
  }

  // Show top 3 properties
  const displayProperties = properties.slice(0, 3);
  const totalValue = properties.reduce((sum, property) => sum + ((property as any).current_value || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Antall eiendommer</p>
          <p className="text-lg font-semibold">{properties.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total verdi</p>
          <p className="text-lg font-semibold">
            {totalValue > 0 ? formatCurrency(totalValue) : 'Ikke satt'}
          </p>
        </div>
      </div>

      {/* Property List */}
      <div className="space-y-3">
        {displayProperties.map((property) => (
          <div
            key={property.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{property.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {property.type}
                  </Badge>
                  {(property as any).current_value && (
                    <span>{formatCurrency((property as any).current_value)}</span>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* View All Link */}
      {properties.length > 3 && (
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/properties')}
            className="w-full flex items-center gap-2"
          >
            Se alle {properties.length} eiendommer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};