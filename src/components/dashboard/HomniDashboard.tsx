/**
 * Homni Dashboard - Main dashboard with plugin system integration
 * Part of Homni platform development plan
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePluginSystemContext } from '@/lib/core/PluginSystemProvider';
import { useFeatureFlags } from '@/lib/feature-flags/FeatureFlagProvider';
import { useLocalization } from '@/lib/localization/LocalizationProvider';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { 
  Activity, 
  Settings, 
  Users, 
  Home, 
  Bell,
  BarChart3,
  CheckCircle,
  Loader2,
  Globe
} from 'lucide-react';

export const HomniDashboard: React.FC = () => {
  const { user, profile, isAuthenticated } = useIntegratedAuth();
  const { 
    isInitialized,
    loadedPlugins,
    navigationItems,
    dashboardWidgets,
    error
  } = usePluginSystemContext();
  
  const { flags, hasAccess } = useFeatureFlags();
  const { locale, t } = useLocalization();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">Vennligst logg inn for å se dashboardet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('dashboard.welcome', `Velkommen, ${profile?.display_name || profile?.full_name || 'Bruker'}`)}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle', 'Din personlige Homni-opplevelse')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {locale.toUpperCase()}
            </Badge>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? 'System Klar' : 'Laster...'}
            </Badge>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plugin System</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isInitialized ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
                <span className="text-2xl font-bold">{loadedPlugins.length}</span>
                <span className="text-xs text-muted-foreground">moduler lastet</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{flags.length}</span>
                <span className="text-xs text-muted-foreground">features tilgjengelig</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Navigasjon</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{navigationItems.length}</span>
                <span className="text-xs text-muted-foreground">meny-elementer</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Widgets</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{dashboardWidgets.length}</span>
                <span className="text-xs text-muted-foreground">widgets tilgjengelig</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">System Feil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Items */}
        {navigationItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tilgjengelige Moduler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {navigationItems.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      {item.icon === 'Users' && <Users className="h-5 w-5" />}
                      {item.icon === 'Home' && <Home className="h-5 w-5" />}
                      {item.icon === 'Bell' && <Bell className="h-5 w-5" />}
                      {item.icon === 'BarChart3' && <BarChart3 className="h-5 w-5" />}
                      {item.icon === 'Settings' && <Settings className="h-5 w-5" />}
                      {!['Users', 'Home', 'Bell', 'BarChart3', 'Settings'].includes(item.icon || '') && (
                        <Activity className="h-5 w-5" />
                      )}
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.href}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Widgets */}
        {dashboardWidgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardWidgets.map((widget, index) => (
                  <Card key={widget.id || index} className="p-4">
                    <h3 className="font-medium mb-2">{widget.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Component: {widget.component}
                    </p>
                    <Button variant="outline" size="sm">
                      Åpne Widget
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Flags Overview */}
        {flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aktiverte Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {flags
                  .filter(flag => hasAccess(flag.name))
                  .map((flag) => (
                    <Badge key={flag.id} variant="default" className="text-xs">
                      {flag.name}
                    </Badge>
                  ))}
              </div>
              {flags.filter(flag => hasAccess(flag.name)).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ingen spesielle features aktivert for din bruker.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Informasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Bruker ID:</strong> {user?.id}</div>
            <div><strong>Rolle:</strong> {profile?.role || 'Ukjent'}</div>
            <div><strong>Konto Type:</strong> {profile?.account_type || 'Ukjent'}</div>
            {profile?.company_id && (
              <div><strong>Firma ID:</strong> {profile.company_id}</div>
            )}
            <div><strong>Språk:</strong> {locale}</div>
            <div><strong>System Status:</strong> {isInitialized ? 'Initialisert' : 'Laster...'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};