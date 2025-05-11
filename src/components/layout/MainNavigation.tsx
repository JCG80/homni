
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export const MainNavigation = () => {
  const { isAuthenticated, role } = useAuth();
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Home Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <NavLink to="/" 
              className={({ isActive }) => 
                cn({ "bg-accent text-accent-foreground": isActive })
              }
            >
              Hjem
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Services */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Tjenester</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2">
              <NavLink to="/strom" 
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">Strøm</div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Sammenlign strømpriser og finn den beste avtalen.
                </p>
              </NavLink>
              
              <NavLink to="/forsikring/companies"
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">Forsikring</div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Sammenlign forsikringsselskaper og få tilbud.
                </p>
              </NavLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Comparison Pages */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Sammenligninger</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[400px] md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <NavLink to="/strom"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Strøm</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Sammenlign strømleverandører og finn beste priser.
                    </p>
                  </NavLink>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <NavLink to="/forsikring/compare"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Forsikring</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Få tilbud på forsikring fra flere selskaper.
                    </p>
                  </NavLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Conditional menus based on authentication */}
        {isAuthenticated && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <NavLink to="/dashboard" 
                  className={({ isActive }) => 
                    cn({ "bg-accent text-accent-foreground": isActive })
                  }
                >
                  Dashboard
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <NavLink to="/profile" 
                  className={({ isActive }) => 
                    cn({ "bg-accent text-accent-foreground": isActive })
                  }
                >
                  Min profil
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <NavLink to="/leads" 
                  className={({ isActive }) => 
                    cn({ "bg-accent text-accent-foreground": isActive })
                  }
                >
                  Forespørsler
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Admin section with System Modules */}
            {(role === 'admin' || role === 'master_admin') && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink to="/admin/leads"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Leads</div>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink to="/admin/roles"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Roller</div>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink to="/admin/system-modules"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Systemmoduler</div>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
