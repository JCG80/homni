
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LayoutGrid } from 'lucide-react';
import { 
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { AdminNavigation } from './AdminNavigation';

interface AuthenticatedNavigationProps {
  role?: UserRole;
  isAuthenticated: boolean;
}

export const AuthenticatedNavigation: React.FC<AuthenticatedNavigationProps> = ({ 
  isAuthenticated,
  role 
}) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <NavigationMenuItem>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
          }
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </NavLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
          }
        >
          <Users className="h-4 w-4 mr-2" />
          Min profil
        </NavLink>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <NavLink 
          to="/leads" 
          className={({ isActive }) => 
            cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
          }
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Forespørsler
        </NavLink>
      </NavigationMenuItem>

      {/* Admin section with System Modules */}
      <AdminNavigation role={role} />
    </>
  );
};
