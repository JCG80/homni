import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageSquare, 
  User, 
  Building,
  ArrowRight,
  Plus,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavigationSection {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  color: string;
  actions: {
    label: string;
    href: string;
    icon: React.ComponentType<any>;
  }[];
}

export const DashboardNavigationCard: React.FC = () => {
  const navigate = useNavigate();

  const sections: NavigationSection[] = [
    {
      title: 'Mine Eiendommer',
      description: 'Administrer eiendommer, dokumenter og vedlikehold',
      icon: Building,
      href: '/properties',
      color: 'text-blue-600',
      actions: [
        { label: 'Se eiendommer', href: '/properties', icon: Building },
        { label: 'Legg til eiendom', href: '/properties/new', icon: Plus },
        { label: 'Dokumenter', href: '/properties?tab=documents', icon: MessageSquare }
      ]
    },
    {
      title: 'Mine Forespørsler',
      description: 'Forespørsler, meldinger, tilbud og omtaler',
      icon: MessageSquare,
      href: '/leads',
      badge: '3',
      color: 'text-green-600',
      actions: [
        { label: 'Se forespørsler', href: '/leads', icon: MessageSquare },
        { label: 'Send forespørsel', href: '/', icon: Plus },
        { label: 'Meldinger', href: '/leads?tab=messages', icon: MessageSquare }
      ]
    },
    {
      title: 'Min Profil',
      description: 'Kontoinnstillinger og personlige preferanser',
      icon: User,
      href: '/account',
      color: 'text-purple-600',
      actions: [
        { label: 'Rediger profil', href: '/account?tab=profile', icon: User },
        { label: 'Innstillinger', href: '/account?tab=settings', icon: Settings },
        { label: 'Varsler', href: '/account?tab=notifications', icon: MessageSquare }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Navigasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link to={section.href}>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {section.actions.map((action) => (
                <Button 
                  key={action.label}
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8"
                  asChild
                >
                  <Link to={action.href}>
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};