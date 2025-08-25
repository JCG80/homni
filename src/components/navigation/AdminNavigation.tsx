
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { UserRole } from '@/types/auth';

interface AdminNavigationProps {
  role?: UserRole;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ role }) => {
  // Only render if user is admin or master_admin
  if (role !== 'admin' && role !== 'master_admin' && role !== 'content_editor') {
    return null;
  }
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Settings className="h-4 w-4 mr-2" />
        {role === 'content_editor' ? 'Innhold' : 'Admin'}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] md:grid-cols-2">
          {/* Admin and master admin can see leads management */}
          {(role === 'admin' || role === 'master_admin') && (
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
          )}

          {/* Admin and master admin can see insurance management */}
          {(role === 'admin' || role === 'master_admin') && (
            <li>
              <NavLink 
                to="/admin/insurance/companies"
                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <div className="text-sm font-medium leading-none">Forsikring</div>
                <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                  Administrasjon av forsikringsselskaper
                </p>
              </NavLink>
            </li>
          )}

          {/* All admin roles can access system modules */}
          {(role === 'admin' || role === 'master_admin') && (
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
          )}

          {/* Content editor, admin and master admin can access content management */}
          {(role === 'content_editor' || role === 'admin' || role === 'master_admin') && (
            <li>
              <NavLink 
                to="/admin/content"
                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <div className="text-sm font-medium leading-none">Innholdsredigering</div>
                <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                  Rediger nettsideinnhold
                </p>
              </NavLink>
            </li>
          )}
          
          {/* Only master_admin can access role and user management */}
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
              <li>
                <NavLink 
                  to="/admin/companies"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Bedrifter</div>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    Administrasjon av bedrifter
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
