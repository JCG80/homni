
import React, { useEffect } from 'react';
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
  // Enhanced debugging
  useEffect(() => {
    console.log("AuthenticatedNavigation - Rendering with:", { isAuthenticated, role });
  }, [isAuthenticated, role]);
  
  if (!isAuthenticated) {
    console.log("AuthenticatedNavigation - Not rendering: User not authenticated");
    return null;
  }

  // Ensure we have a consistent dashboard route based on role
  const getDashboardRoute = () => {
    if (!role) {
      console.log("AuthenticatedNavigation - No role, using default dashboard route");
      return "/dashboard";
    }
    const route = `/dashboard/${role}`;
    console.log(`AuthenticatedNavigation - Using role-specific dashboard route: ${route}`);
    return route;
  };
  
  const dashboardRoute = getDashboardRoute();
  
  return (
    <>
      <NavigationMenuItem>
        <NavLink 
          to={dashboardRoute} 
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
