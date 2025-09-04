import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { PropertyList } from '../components/PropertyList';
import { PropertyStats } from '../components/PropertyStats';
import { QuickActions } from '../components/QuickActions';
import { useProperties } from '../hooks/useProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PropertyDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { properties, isLoading, error } = useProperties();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mine Eiendommer</h1>
          <p className="text-muted-foreground">
            Administrer dine eiendommer, dokumenter og utgifter
          </p>
        </div>
        <Button onClick={() => navigate('/properties/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny Eiendom
        </Button>
      </div>

      <PropertyStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Mine Eiendommer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyList properties={properties || []} isLoading={isLoading} error={error} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <QuickActions />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Siste Dokumenter
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
              Ingen dokumenter ennå
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Siste Utgifter
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
              Ingen utgifter registrert
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}