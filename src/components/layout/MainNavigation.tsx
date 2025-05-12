
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Settings, LayoutGrid } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const MainNavigation = () => {
  const { isAuthenticated, role } = useAuth();
  const isMobile = useIsMobile();
  
  // For mobile, we'll handle navigation differently via the sidebar
  if (isMobile) return null;
  
  // Group services by category for better organization
  const propertyServices = [
    { title: 'Eiendommer', description: 'Administrér dine eiendommer', path: '/properties' },
    { title: 'Boligkjøp', description: 'Råd og verktøy for boligkjøp', path: '/boligkjop' },
  ];
  
  const utilityServices = [
    { title: 'Strøm', description: 'Sammenlign strømpriser og finn den beste avtalen', path: '/strom' },
    { title: 'Bredbånd', description: 'Finn den raskeste og beste løsningen', path: '/bredband' },
  ];
  
  const insuranceServices = [
    { title: 'Forsikringssammenligning', description: 'Sammenlign forsikringsselskaper', path: '/forsikring/companies' },
    { title: 'Forsikringstilbud', description: 'Få tilbud på forsikring', path: '/forsikring/quote' },
  ];
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Home Link */}
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

        {/* Property Services */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Home className="h-4 w-4 mr-2" />
            Bolig
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-1">
              {propertyServices.map((service) => (
                <NavLink key={service.title} to={service.path} 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">{service.title}</div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    {service.description}
                  </p>
                </NavLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Utility Services */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Tjenester
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2">
              {utilityServices.map((service) => (
                <NavLink key={service.title} to={service.path} 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">{service.title}</div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    {service.description}
                  </p>
                </NavLink>
              ))}
              
              {insuranceServices.map((service) => (
                <NavLink key={service.title} to={service.path}
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">{service.title}</div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    {service.description}
                  </p>
                </NavLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Conditional menus based on authentication */}
        {isAuthenticated && (
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
            {(role === 'admin' || role === 'master_admin') && (
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
            )}
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
