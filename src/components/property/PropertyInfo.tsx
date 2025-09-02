import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Home, MapPin, Ruler } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  type: string;
  address?: string;
  size?: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

interface PropertyInfoProps {
  property: Property;
}

export const PropertyInfo = ({ property }: PropertyInfoProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eiendomstype</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant="outline">{property.type}</Badge>
        </CardContent>
      </Card>

      {property.address && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adresse</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">{property.address}</p>
          </CardContent>
        </Card>
      )}

      {property.size && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Størrelse</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{property.size} m²</p>
          </CardContent>
        </Card>
      )}

      {property.purchase_date && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kjøpsdato</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(property.purchase_date).toLocaleDateString('nb-NO')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registrert</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {new Date(property.created_at).toLocaleDateString('nb-NO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};