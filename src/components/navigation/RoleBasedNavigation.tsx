
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

interface RoleBasedNavigationProps {
  className?: string;
  variant?: 'vertical' | 'horizontal';
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
  className,
  variant = 'vertical'
}) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const currentRole = isAuthenticated ? role : 'guest';
  const navItems = getNavigation(currentRole as UserRole);
  
  const isActive = (href: string) => {
    // Check if the current location matches the nav item
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };
  
  return (
    <nav className={cn(
      "flex",
      variant === 'vertical' ? "flex-col space-y-1" : "contents",
      className
    )}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        // For horizontal navigation (used in NavigationMenu)
        if (variant === 'horizontal') {
          return (
            <NavigationMenuItem key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  navigationMenuTriggerStyle(),
                  active && "bg-accent text-accent-foreground"
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {item.title}
              </Link>
            </NavigationMenuItem>
          );
        }
        
        // For vertical navigation (sidebar style)
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors relative",
              active 
                ? "text-primary-foreground bg-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {active && (
              <motion.div
                layoutId="active-nav-item"
                className="absolute inset-0 bg-primary rounded-md z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            
            {Icon && (
              <Icon className={cn(
                "mr-2 h-4 w-4",
                active ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            )}
            
            <span className="relative z-10">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
