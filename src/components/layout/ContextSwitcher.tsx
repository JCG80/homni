import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ChevronDown, User, Shield, Building2, Zap, Star } from 'lucide-react';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { useNavigate } from 'react-router-dom';

interface ContextSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function ContextSwitcher({ className, variant = 'compact' }: ContextSwitcherProps) {
  const { role, isAuthenticated } = useAuth();
  const { getRecommendedRoutes } = useNavigationContext();
  const navigate = useNavigate();

  if (!isAuthenticated || !role) {
    return null;
  }

  const currentRole = role as UserRole;
  const recommendedRoutes = getRecommendedRoutes(currentRole);
  
  const contextInfo = {
    user: { icon: User, label: 'Bruker', color: 'bg-blue-500' },
    company: { icon: Building2, label: 'Bedrift', color: 'bg-purple-500' },
    admin: { icon: Shield, label: 'Admin', color: 'bg-red-500' },
    master_admin: { icon: Shield, label: 'Master Admin', color: 'bg-red-600' },
    content_editor: { icon: User, label: 'Redaktør', color: 'bg-green-500' },
    guest: { icon: User, label: 'Gjest', color: 'bg-gray-500' },
  };

  const current = contextInfo[currentRole];
  const Icon = current.icon;

  const isAdminContext = ['admin', 'master_admin'].includes(currentRole);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={variant === 'compact' ? 'sm' : 'default'}
            className="flex items-center gap-2 h-auto px-2 py-1"
          >
            <div className={`w-2 h-2 rounded-full ${current.color}`} />
            <Icon className="h-4 w-4" />
            {variant === 'full' && (
              <>
                <span className="text-sm">{current.label}</span>
                {isAdminContext && (
                  <Badge variant="destructive" className="text-xs">
                    ADMIN
                  </Badge>
                )}
              </>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            Aktiv kontekst: {current.label}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Quick Access Routes */}
          {recommendedRoutes.length > 0 && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Hurtigtilgang
              </DropdownMenuLabel>
              {recommendedRoutes.slice(0, 3).map((route) => (
                <DropdownMenuItem 
                  key={route}
                  onClick={() => navigate(route)}
                  className="text-sm"
                >
                  <Star className="h-3 w-3 mr-2" />
                  {route.split('/').pop()?.replace('-', ' ') || route}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Context Actions */}
          <DropdownMenuItem 
            onClick={() => navigate(isAdminContext ? '/dashboard' : '/admin')}
            className="text-sm"
          >
            {isAdminContext ? (
              <>
                <User className="h-4 w-4 mr-2" />
                Bytt til brukermodus
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Bytt til admin
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}