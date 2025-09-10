import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  Camera, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

interface PropertySummary {
  id: string;
  address: string;
  type: string;
  documentsCount: number;
  documentsTotal: number;
  maintenanceTasksCount: number;
  maintenanceOverdue: number;
  completionScore: number;
  lastUpdated: string;
}

export const PropertyIntegrationWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useIntegratedAuth();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPropertySummary();
    }
  }, [user]);

  const fetchPropertySummary = async () => {
    try {
      // Simulate property data
      const mockProperties: PropertySummary[] = [
        {
          id: 'prop-1',
          address: 'Storgata 123, Oslo',
          type: 'Enebolig',
          documentsCount: 8,
          documentsTotal: 12,
          maintenanceTasksCount: 3,
          maintenanceOverdue: 1,
          completionScore: 67,
          lastUpdated: new Date().toISOString()
        }
      ];

      setProperties(mockProperties);
    } catch (error) {
      console.error('Error fetching property summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Mine eiendommer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Ingen eiendommer registrert</p>
            <Button onClick={() => navigate('/property')}>
              <Plus className="mr-2 h-4 w-4" />
              Registrer eiendom
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const property = properties[0]; // Show first property for now

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Min eiendom
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/property')}
          >
            Se detaljer
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Overview */}
        <div>
          <h3 className="font-medium">{property.address}</h3>
          <p className="text-sm text-muted-foreground">{property.type}</p>
        </div>

        {/* Completion Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Dokumentasjon fullført</span>
            <div className="flex items-center gap-2">
              {getCompletionIcon(property.completionScore)}
              <span className={`text-sm font-medium ${getCompletionColor(property.completionScore)}`}>
                {property.completionScore}%
              </span>
            </div>
          </div>
          <Progress value={property.completionScore} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {property.documentsCount}/{property.documentsTotal}
              </p>
              <p className="text-xs text-muted-foreground">Dokumenter</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {property.maintenanceTasksCount}
                {property.maintenanceOverdue > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {property.maintenanceOverdue}
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">Vedlikehold</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/property?tab=documents')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Dokumenter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/property?tab=maintenance')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Vedlikehold
          </Button>
        </div>

        {/* Maintenance Alert */}
        {property.maintenanceOverdue > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                {property.maintenanceOverdue} forfalt vedlikehold
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/property?tab=maintenance')}
              className="p-0 h-auto text-red-600"
            >
              Se detaljer →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};