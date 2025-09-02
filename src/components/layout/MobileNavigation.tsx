import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { navUser, navControl } from '@/config/navigation';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { cn } from '@/lib/utils';
import { PersonaSwitcher } from './PersonaSwitcher';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated || !role) {
    return null;
  }

  const userRole = role as UserRole;
  const navigation = navUser[userRole] || [];
  const controlNavigation = navControl[userRole] || [];
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {/* Role/Persona Switcher */}
      <div className="px-3 py-2 border-b border-border">
        <PersonaSwitcher />
      </div>
      
      {/* User Navigation */}
      {navigation.length > 0 && (
        <div className="px-3 py-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Navigation</h3>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 rounded-md text-sm transition-colors",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Control/Admin Navigation */}
      {controlNavigation.length > 0 && (
        <div className="px-3 py-2 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Admin</h3>
          <div className="space-y-1">
            {controlNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 rounded-md text-sm transition-colors",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};