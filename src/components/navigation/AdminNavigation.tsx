
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { UserRole } from '@/modules/auth/utils/roles/types';

interface AdminNavigationProps {
  role?: UserRole;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ role }) => {
  // Only render if user is admin or master_admin
  if (role !== 'admin' && role !== 'master_admin') {
    return null;
  }
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Settings className="h-4 w-4 mr-2" />
        Admin
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] md:grid-cols-2">
          <li>
            <NavLink 
              to="/admin/leads"
              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="text-sm font-medium leading-none">Leads</div>
              <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                Håndtering av kundeforespørsler
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/system-modules"
              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="text-sm font-medium leading-none">Systemmoduler</div>
              <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                Oversikt over systemmoduler
              </p>
            </NavLink>
          </li>
          {role === 'master_admin' && (
            <>
              <li>
                <NavLink 
                  to="/admin/roles"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Roller</div>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    Håndtering av brukerroller
                  </p>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/members"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Brukere</div>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    Administrasjon av medlemmer
                  </p>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
