
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
import { AuthenticatedNavigation } from '../navigation/AuthenticatedNavigation';

export const MainNavigation = () => {
  const { isAuthenticated, role } = useAuth();
  const isMobile = useIsMobile();
  
  // For mobile, we'll handle navigation differently via the sidebar
  if (isMobile) return null;
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Home Link */}
        <HomeNavLink />

        {/* Property Services */}
        <PropertyNavigation />

        {/* Utility Services */}
        <ServicesNavigation />

        {/* Conditional menus based on authentication */}
        <AuthenticatedNavigation 
          isAuthenticated={isAuthenticated} 
          role={role} 
        />
      </NavigationMenuList>
    </NavigationMenu>
  );
};
