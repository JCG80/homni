import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  Settings, 
  Heart, 
  Plus, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
}

export const PropertyNavigationBar: React.FC = () => {
  const location = useLocation();

  const navItems: PropertyNavItem[] = [
    {
      href: '/properties',
      label: 'Oversikt',
      icon: Home,
      description: 'Alle eiendommer'
    },
    {
      href: '/properties?tab=documents',
      label: 'Dokumenter',
      icon: FileText,
      description: 'Dokumentarkiv'
    },
    {
      href: '/properties?tab=maintenance',
      label: 'Vedlikehold',
      icon: Calendar,
      description: 'Planlegg og spor'
    },
    {
      href: '/properties?tab=propr',
      label: 'DIY Salg',
      icon: Heart,
      description: 'Selg selv'
    },
    {
      href: '/properties/analytics',
      label: 'Analyser',
      icon: TrendingUp,
      description: 'Verdisporing'
    }
  ];

  const isActive = (href: string) => {
    const currentPath = location.pathname + location.search;
    return currentPath === href || currentPath.startsWith(href);
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
          
          <Button size="sm" asChild>
            <Link to="/properties/new">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ny eiendom</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};