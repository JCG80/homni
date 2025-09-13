import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  User, 
  Plus,
  Building,
  Activity
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
  primary?: boolean;
}

export const OptimizedNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navigationItems: NavigationItem[] = [
    {
      href: '/dashboard/user',
      label: 'Dashboard',
      icon: Home,
      description: 'Hovedoversikt',
      primary: true
    },
    {
      href: '/properties',
      label: 'Mine eiendommer',
      icon: Building,
      description: 'Administrer eiendommer og dokumenter',
      primary: true
    },
    {
      href: '/leads',
      label: 'Forespørsler',
      icon: MessageSquare,
      description: 'Mine forespørsler'
    },
    {
      href: '/profile',
      label: 'Profil',
      icon: User,
      description: 'Min profil'
    },
    {
      href: '/help',
      label: 'Hjelp',
      icon: HelpCircle,
      description: 'Support og FAQ'
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav className="space-y-1">
      {/* Primary Action */}
      <Button 
        className="w-full justify-start mb-4" 
        onClick={() => navigate('/')}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ny forespørsel
      </Button>

      {/* Navigation Items */}
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive(item.href)
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <item.icon className="w-4 h-4" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <div className="text-xs opacity-75 mt-0.5">
                {item.description}
              </div>
            )}
          </div>
        </Link>
      ))}
    </nav>
  );
};