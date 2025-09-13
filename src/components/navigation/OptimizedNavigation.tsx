import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { cn } from '@/lib/utils';

export const OptimizedNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { navigation, isLoading } = useModuleNavigation();

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <nav className="space-y-1">
        <div className="h-10 bg-muted animate-pulse rounded-lg mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
        ))}
      </nav>
    );
  }

  // Use primary navigation items from unified system
  const navigationItems = navigation.primary;

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav className="space-y-1">
      {/* Primary Action */}
      <Button 
        className="w-full justify-start mb-4" 
        onClick={() => navigate('/leads/new')}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ny forespørsel
      </Button>

      {/* Navigation Items */}
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
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
            {Icon && typeof Icon === 'function' && <Icon className="w-4 h-4" />}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>{item.title}</span>
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
        );
      })}
    </nav>
  );
};