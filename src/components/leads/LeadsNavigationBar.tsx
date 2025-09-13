import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Briefcase, 
  Star, 
  Plus, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadsNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
}

export const LeadsNavigationBar: React.FC = () => {
  const location = useLocation();

  const navItems: LeadsNavItem[] = [
    {
      href: '/leads',
      label: 'Oversikt',
      icon: TrendingUp,
      description: 'Alle forespørsler'
    },
    {
      href: '/leads?tab=messages',
      label: 'Meldinger',
      icon: MessageSquare,
      description: 'Kommunikasjon'
    },
    {
      href: '/leads?tab=offers',
      label: 'Tilbud',
      icon: Briefcase,
      description: 'Mottatte tilbud'
    },
    {
      href: '/leads?tab=reviews',
      label: 'Omtaler',
      icon: Star,
      description: 'Mine vurderinger'
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
            <Link to="/">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ny forespørsel</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};