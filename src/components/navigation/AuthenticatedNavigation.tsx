
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LayoutGrid } from 'lucide-react';
import { 
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { UserRole } from '@/modules/auth/normalizeRole';
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

  // Ensure we have a consistent dashboard route based on role
  const getDashboardRoute = () => {
    switch (role) {
      case 'user':
        return '/dashboard/user';
      case 'company':
        return '/dashboard/company';
      case 'content_editor':
        return '/dashboard/content-editor';
      case 'admin':
      case 'master_admin':
        return '/dashboard';
      default:
        return '/dashboard';
    }
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
