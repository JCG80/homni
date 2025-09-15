import React, { useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { normalizeRole } from '@/modules/auth/normalizeRole';
import { mainRouteObjects } from '@/routes/mainRouteObjects';
import type { AppRoute } from '@/routes/routeTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const SiteMapPage: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  
  const userRole = useMemo(() => {
    if (!isAuthenticated) return 'guest';
    return role || 'guest';
  }, [isAuthenticated, role]);

  const groupedRoutes = useMemo(() => {
    const groups: Record<string, AppRoute[]> = {
      'Offentlige sider': [],
      'Bruker dashboard': [],
      'Bedrift': [],
      'Administrasjon': [],
      'Forsikring': [],
      'Eiendom': [],
      'Leads': [],
      'Vedlikehold': [],
      'Innhold': [],
      'Andre': []
    };

    mainRouteObjects.forEach(route => {
      if (route.path.startsWith('/admin')) {
        groups['Administrasjon'].push(route);
      } else if (route.path.includes('insurance') || route.path.includes('forsikring')) {
        groups['Forsikring'].push(route);
      } else if (route.path.includes('properties') || route.path.includes('eiendom')) {
        groups['Eiendom'].push(route);
      } else if (route.path.includes('leads')) {
        groups['Leads'].push(route);
      } else if (route.path.includes('maintenance') || route.path.includes('vedlikehold')) {
        groups['Vedlikehold'].push(route);
      } else if (route.path.includes('content') || route.path.includes('innhold')) {
        groups['Innhold'].push(route);
      } else if (route.path.includes('dashboard')) {
        groups['Bruker dashboard'].push(route);
      } else if (route.path.includes('company') || route.path.includes('bedrift')) {
        groups['Bedrift'].push(route);
      } else if (route.alwaysAvailable || !route.roles || route.roles.includes('guest')) {
        groups['Offentlige sider'].push(route);
      } else {
        groups['Andre'].push(route);
      }
    });

    return groups;
  }, []);

  const hasAccess = (route: AppRoute): boolean => {
    if (route.alwaysAvailable) return true;
    if (!route.roles || route.roles.length === 0) return true;
    return route.roles.includes(userRole);
  };

  const getRoleBadgeColor = (roles: string[] | undefined): string => {
    if (!roles || roles.includes('guest')) return 'bg-green-100 text-green-800';
    if (roles.includes('master_admin')) return 'bg-red-100 text-red-800';
    if (roles.includes('admin')) return 'bg-orange-100 text-orange-800';
    if (roles.includes('company')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nettstedsoversikt</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Din rolle: <Badge variant="outline">{userRole}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Totalt {mainRouteObjects.length} ruter definert</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRoutes).map(([groupName, routes]) => {
          if (routes.length === 0) return null;

          return (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-xl">{groupName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routes.map((route, index) => {
                    const accessible = hasAccess(route);
                    
                    return (
                      <div 
                        key={`${route.path}-${index}`}
                        className={`p-4 border rounded-lg transition-colors ${
                          accessible 
                            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                                {route.path}
                              </code>
                              {route.navKey && (
                                <Badge variant="outline" className="text-xs">
                                  {route.navKey}
                                </Badge>
                              )}
                              {route.flag && (
                                <Badge variant="outline" className="text-xs bg-yellow-100">
                                  Flag: {route.flag}
                                </Badge>
                              )}
                            </div>
                            
                            {route.roles && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {route.roles.map(role => (
                                  <Badge 
                                    key={role}
                                    className={`text-xs ${getRoleBadgeColor(route.roles)}`}
                                  >
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {accessible && (
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm"
                              className="ml-4"
                            >
                              <Link to={route.path}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Besøk
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Om denne siden</h3>
        <p className="text-blue-800 text-sm">
          Denne siden viser alle definerte ruter i systemet og din tilgang til dem. 
          Grønne kort indikerer sider du kan besøke med din nåværende rolle ({userRole}).
        </p>
      </div>
    </div>
  );
};