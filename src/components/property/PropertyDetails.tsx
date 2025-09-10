import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Settings, Plus, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyDocuments } from './PropertyDocuments';
import { PropertyDocumentationDashboard } from './enhanced';
import { PropertyInfo } from './PropertyInfo';
import { useAuth } from '@/modules/auth/hooks';

interface PropertyDetailsProps {
  propertyId: string;
}

export const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const { user } = useAuth();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Eiendom ikke funnet</h3>
        <p className="text-muted-foreground mb-4">
          Denne eiendommen eksisterer ikke eller du har ikke tilgang til den.
        </p>
        <Button asChild>
          <Link to="/property">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til mine eiendommer
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/property">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <Badge variant="outline">{property.type}</Badge>
          </div>
          {property.address && (
            <p className="text-muted-foreground">{property.address}</p>
          )}
        </div>
        
        <Button variant="outline" asChild>
          <Link to={`/property/${property.id}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Innstillinger
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
          <TabsTrigger value="maintenance">Vedlikehold</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PropertyInfo property={property} />
        </TabsContent>

        <TabsContent value="documents">
          <PropertyDocumentationDashboard propertyId={property.id} />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Vedlikehold</CardTitle>
              <CardDescription>
                Spor vedlikehold, reparasjoner og oppgraderinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Vedlikeholdsfunksjon kommer snart...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};