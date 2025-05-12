
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

export const HomeNavLink = () => {
  return (
    <NavigationMenuItem>
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
        }
      >
        <Home className="h-4 w-4 mr-2" />
        Hjem
      </NavLink>
    </NavigationMenuItem>
  );
};
