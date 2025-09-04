import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Home, MapPin, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  name: string;
  type: string;
  address?: string;
  size?: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  error: Error | null;
}

export function PropertyList({ properties, isLoading, error }: PropertyListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Laster eiendommer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Feil ved lasting av eiendommer: {error.message}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-8">
        <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Ingen eiendommer registrert</h3>
        <p className="text-muted-foreground mb-4">
          Kom i gang ved å legge til din første eiendom
        </p>
        <Button onClick={() => navigate('/properties/new')}>
          Legg til eiendom
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{property.name}</h3>
                  <Badge variant="secondary">
                    {property.type}
                  </Badge>
                </div>
                
                {property.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {property.size && (
                    <span>{property.size} m²</span>
                  )}
                  {property.purchase_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(property.purchase_date).toLocaleDateString('no-NO')}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/properties/${property.id}`)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vis detaljer
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}