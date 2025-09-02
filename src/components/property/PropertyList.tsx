import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, Settings } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { Link } from 'react-router-dom';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  size: number;
  purchase_date: string;
  created_at: string;
}

export const PropertyList = () => {
  const { user } = useAuth();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen eiendommer registrert</h3>
          <p className="text-muted-foreground text-center mb-4">
            Legg til din første eiendom for å begynne å administrere dokumentasjon og vedlikehold.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{property.name || property.address}</span>
              <Badge variant="outline">{property.type}</Badge>
            </CardTitle>
            <CardDescription>
              {property.size && `${property.size} m²`}
              {property.purchase_date && ` • Kjøpt ${new Date(property.purchase_date).getFullYear()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/property/${property.id}`}>
                  <FileText className="mr-1 h-3 w-3" />
                  Vis detaljer
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/property/${property.id}/settings`}>
                  <Settings className="mr-1 h-3 w-3" />
                  Innstillinger
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};