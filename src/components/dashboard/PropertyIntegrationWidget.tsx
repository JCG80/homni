import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProperty } from '@/modules/property/hooks/useProperty';
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
import { CreatePropertyDialog } from '@/modules/property/components/CreatePropertyDialog';

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
  const { properties, loading } = useProperty();
  const [showPropertyDialog, setShowPropertyDialog] = useState(false);

  // Calculate property completion score based on available data
  const getPropertyCompletionScore = (property: any) => {
    let score = 0;
    let total = 0;
    
    // Basic info (40% weight)
    if (property.name) { score += 10; total += 10; }
    if (property.address) { score += 10; total += 10; }
    if (property.type) { score += 10; total += 10; }
    if (property.size) { score += 10; total += 10; }
    
    // Additional info (60% weight)
    if (property.purchase_date) { score += 15; total += 15; }
    if (property.current_value) { score += 15; total += 15; }
    if (property.description) { score += 15; total += 15; }
    if (property.status) { score += 15; total += 15; }
    
    return total > 0 ? Math.round((score / total) * 100) : 0;
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

  if (!properties || properties.length === 0) {
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
            <Button onClick={() => setShowPropertyDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrer eiendom
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const property = properties[0]; // Show first property for now
  const completionScore = getPropertyCompletionScore(property);
  const propertyType = property.type === 'apartment' ? 'Leilighet' :
                      property.type === 'house' ? 'Enebolig' :
                      property.type === 'townhouse' ? 'Rekkehus' :
                      property.type === 'cabin' ? 'Hytte' :
                      property.type === 'commercial' ? 'Næring' :
                      property.type === 'land' ? 'Tomt' : 'Annet';

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
            onClick={() => navigate('/properties')}
          >
            Se detaljer
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Overview */}
        <div>
          <h3 className="font-medium">{property.name}</h3>
          <p className="text-sm text-muted-foreground">
            {property.address || 'Ingen adresse angitt'} • {propertyType}
          </p>
        </div>

        {/* Completion Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profil fullført</span>
            <div className="flex items-center gap-2">
              {getCompletionIcon(completionScore)}
              <span className={`text-sm font-medium ${getCompletionColor(completionScore)}`}>
                {completionScore}%
              </span>
            </div>
          </div>
          <Progress value={completionScore} className="h-2" />
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {property.size ? `${property.size} m²` : 'Ikke angitt'}
              </p>
              <p className="text-xs text-muted-foreground">Størrelse</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {property.purchase_date ? new Date(property.purchase_date).getFullYear() : 'Ikke angitt'}
              </p>
              <p className="text-xs text-muted-foreground">Kjøpsår</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/properties/${property.id}?tab=documents`)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Dokumenter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/properties/${property.id}?tab=maintenance`)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Vedlikehold
          </Button>
        </div>

        {/* Completion improvement tip */}
        {completionScore < 80 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">
                Fullfør eiendomprofilen for bedre oversikt
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate(`/properties/${property.id}`)}
              className="p-0 h-auto text-blue-600"
            >
              Rediger eiendom →
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Property Creation Dialog */}
      <CreatePropertyDialog 
        open={showPropertyDialog}
        onOpenChange={setShowPropertyDialog}
        onSuccess={() => {
          setShowPropertyDialog(false);
        }}
      />
    </Card>
  );
};