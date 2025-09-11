import React, { useState, useEffect } from 'react';
import { Plus, Home, AlertTriangle, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProperty } from '../hooks/useProperty';
import { CreatePropertyDialog } from './CreatePropertyDialog';
import { PropertyCard } from './PropertyCard';
import { MaintenanceAlerts } from './MaintenanceAlerts';
import { DocumentStatus } from './DocumentStatus';
import { PropertyStats as PropertyStatsType } from '../types/property';

export const PropertyDashboard: React.FC = () => {
  const { properties, loading, error, refreshProperties } = useProperty();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState<PropertyStatsType>({
    totalProperties: 0,
    totalValue: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    documentsCount: 0,
    maintenanceCosts: 0,
  });

  useEffect(() => {
    if (properties) {
      // Calculate stats from properties data
      const calculatedStats: PropertyStatsType = {
        totalProperties: properties.length,
        totalValue: properties.reduce((sum, p) => sum + (p.current_value || p.purchase_price || 0), 0),
        pendingTasks: Math.floor(Math.random() * 10), // Mock data - replace with actual API
        overdueTasks: Math.floor(Math.random() * 3),
        documentsCount: Math.floor(Math.random() * 25),
        maintenanceCosts: Math.floor(Math.random() * 50000),
      };
      setStats(calculatedStats);
    }
  }, [properties]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">Kunne ikke laste eiendommer</p>
            <Button onClick={refreshProperties}>Prøv igjen</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasProperties = properties && properties.length > 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eiendommer</p>
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total verdi</p>
                <p className="text-2xl font-bold">
                  {(stats.totalValue / 1000000).toFixed(1)}M kr
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vedlikehold</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  {stats.overdueTasks > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.overdueTasks} forfalt
                    </Badge>
                  )}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dokumenter</p>
                <p className="text-2xl font-bold">{stats.documentsCount}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {!hasProperties ? (
        /* Empty State */
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Home className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Legg til din første eiendom</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start med å registrere en eiendom for å få tilgang til dokumentlagring, 
                  vedlikeholdsplanlegging og verdisporing.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Legg til eiendom
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mine eiendommer</h2>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Legg til eiendom
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MaintenanceAlerts />
            <DocumentStatus />
          </div>
        </div>
      )}

      {/* Create Property Dialog */}
      <CreatePropertyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refreshProperties}
      />
    </div>
  );
};