
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  NavigationMenu, 
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeNavLink } from '../navigation/HomeNavLink';
import { PropertyNavigation } from '../navigation/PropertyNavigation';
import { ServicesNavigation } from '../navigation/ServicesNavigation';
import { DocsNavigation } from '../navigation/DocsNavigation';
import { AuthenticatedNavigation } from '../navigation/AuthenticatedNavigation';
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
      </NavigationMenuList>
    </NavigationMenu>
  );
};
