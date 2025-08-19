import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveLink } from '@/components/ui/interactive-link';
import { Check, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteTest {
  path: string;
  name: string;
  requiresAuth?: boolean;
  role?: string | string[];
  status: 'working' | 'missing' | 'error';
  description?: string;
}

const testRoutes: RouteTest[] = [
  // Public routes
  { path: '/', name: 'Hjem', status: 'working' },
  { path: '/design-system', name: 'Designsystem', status: 'working' },
  { path: '/login', name: 'Innlogging', status: 'working' },
  { path: '/register', name: 'Registrering', status: 'working' },
  
  // Admin routes
  { path: '/admin/members', name: 'Medlemsadministrasjon', requiresAuth: true, role: ['admin', 'master_admin'], status: 'working' },
  { path: '/admin/companies', name: 'Bedriftsadministrasjon', requiresAuth: true, role: ['admin', 'master_admin'], status: 'working' },
  { path: '/admin/roles', name: 'Rolleadministrasjon', requiresAuth: true, role: 'master_admin', status: 'working' },
  
  // Dashboard routes
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true, status: 'working' },
  { path: '/dashboard/company', name: 'Bedrift Dashboard', requiresAuth: true, role: 'company', status: 'working' },
  { path: '/dashboard/content-editor', name: 'Content Editor', requiresAuth: true, role: 'content_editor', status: 'working' },
];

export const NavigationTester: React.FC = () => {
  const location = useLocation();
  
  const getStatusIcon = (status: RouteTest['status']) => {
    switch (status) {
      case 'working':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <X className="h-4 w-4 text-red-500" />;
      case 'error':
        return <X className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: RouteTest['status']) => {
    switch (status) {
      case 'working':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'missing':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'error':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Navigasjonstester
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {testRoutes.map((route, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-md border",
                getStatusColor(route.status),
                location.pathname === route.path && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(route.status)}
                <div>
                  <div className="font-medium">{route.name}</div>
                  <div className="text-xs text-muted-foreground">{route.path}</div>
                  {route.requiresAuth && (
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">Auth Required</Badge>
                      {route.role && (
                        <Badge variant="outline" className="text-xs">
                          {Array.isArray(route.role) ? route.role.join(', ') : route.role}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {route.status === 'working' ? (
                  <InteractiveLink to={route.path} variant="scale">
                    Test
                  </InteractiveLink>
                ) : (
                  <span className="text-xs text-muted-foreground">Ikke tilgjengelig</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium mb-2">Status oversikt:</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span>Fungerende ruter</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-3 w-3 text-red-500" />
                <span>Manglende implementering</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-3 w-3 text-orange-500" />
                <span>Feil i implementering</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};