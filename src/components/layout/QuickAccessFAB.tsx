import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationContext } from '@/hooks/useNavigationContext';
import { Plus, Star, Clock, Home, Shield, Building2 } from 'lucide-react';
import { UserRole } from '@/modules/auth/normalizeRole';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAccessFABProps {
  className?: string;
}

export function QuickAccessFAB({ className }: QuickAccessFABProps) {
  const { role, isAuthenticated } = useAuth();
  const { preferences, getRecommendedRoutes } = useNavigationContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !role) {
    return null;
  }

  const currentRole = role as UserRole;
  const recommendedRoutes = getRecommendedRoutes(currentRole);
  const quickAccessRoutes = preferences.quickAccessRoutes;

  const quickActions = [
    {
      label: 'Dashboard',
      icon: Home,
      action: () => navigate('/dashboard'),
      show: true,
    },
    {
      label: 'Admin Panel',
      icon: Shield,
      action: () => navigate('/admin'),
      show: ['admin', 'master_admin'].includes(currentRole),
    },
    {
      label: 'Bedrifter',
      icon: Building2,
      action: () => navigate('/companies'),
      show: true,
    },
  ];

  const visibleActions = quickActions.filter(action => action.show);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className={cn("h-6 w-6 transition-transform duration-200", isOpen && "rotate-45")} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          side="top" 
          className="w-56 mb-2"
          sideOffset={8}
        >
          {/* Quick Actions */}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Hurtighandlinger
          </DropdownMenuLabel>
          
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem 
                key={action.label}
                onClick={action.action}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
          
          {/* Quick Access Routes */}
          {quickAccessRoutes.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favoritter
              </DropdownMenuLabel>
              {quickAccessRoutes.slice(0, 3).map((route) => (
                <DropdownMenuItem 
                  key={route}
                  onClick={() => navigate(route)}
                  className="flex items-center gap-2"
                >
                  <Star className="h-3 w-3" />
                  {route.split('/').pop()?.replace('-', ' ') || route}
                </DropdownMenuItem>
              ))}
            </>
          )}
          
          {/* Recent Routes */}
          {recommendedRoutes.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nylig besøkt
              </DropdownMenuLabel>
              {recommendedRoutes.slice(0, 3).map((route) => (
                <DropdownMenuItem 
                  key={route}
                  onClick={() => navigate(route)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-3 w-3" />
                  {route.split('/').pop()?.replace('-', ' ') || route}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}