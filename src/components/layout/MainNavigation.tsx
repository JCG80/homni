import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  NavigationMenu, 
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeNavLink } from '@/components/navigation/HomeNavLink';
import { PropertyNavigation } from '@/components/navigation/PropertyNavigation';
import { ServicesNavigation } from '@/components/navigation/ServicesNavigation';
import { DocsNavigation } from '@/components/navigation/DocsNavigation';
import { AuthenticatedNavigation } from '@/components/navigation/AuthenticatedNavigation';
import { UserRole } from '@/types/auth'; 
import { NavigationMenuItem } from '@/components/ui/navigation-menu';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Building } from 'lucide-react';

export const MainNavigation = () => {
  const { isAuthenticated, role } = useAuth();
  const isMobile = useIsMobile();
  
  // For mobile, we'll handle navigation via MobileNavigation component
  if (isMobile) {
    return (
      <div className="md:hidden flex-1">
        {/* Mobile navigation is handled by Header component's Sheet */}
      </div>
    );
  }
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Home Link */}
        <HomeNavLink />

        {isAuthenticated ? (
          <>
            {/* Property Services */}
            <PropertyNavigation />

            {/* Utility Services */}
            <ServicesNavigation />

            {/* Documentation - now using the DocsNavigation component */}
            <DocsNavigation />

            {/* Companies Link */}
            <NavigationMenuItem>
              <NavLink 
                to="/companies" 
                className={({ isActive }) => 
                  cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
                }
              >
                <Building className="h-4 w-4 mr-2" />
                Partnere
              </NavLink>
            </NavigationMenuItem>

            {/* Conditional menus based on authentication */}
            <AuthenticatedNavigation 
              isAuthenticated={isAuthenticated} 
              role={role as UserRole}
            />
          </>
        ) : (
          <>
            {/* Public navigation focused on working routes */}
            <NavigationMenuItem>
              <NavLink 
                to="/homepage" 
                className={({ isActive }) => 
                  cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
                }
              >
                Utforsk
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink 
                to="/debug" 
                className={({ isActive }) => 
                  cn(navigationMenuTriggerStyle(), { "bg-accent text-accent-foreground": isActive })
                }
              >
                Test
              </NavLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};