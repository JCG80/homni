import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  NavigationMenu, 
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import { useUnifiedNavigation } from '@/hooks/useUnifiedNavigation';

export const MainNavigation = () => {
  const { navigation, isLoading } = useUnifiedNavigation();
  const isMobile = useIsMobile();
  
  // For mobile, we'll handle navigation via MobileNavigation component
  if (isMobile) {
    return (
      <div className="md:hidden flex-1">
        {/* Mobile navigation is handled by Header component's Sheet */}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <RoleBasedNavigation 
          variant="horizontal" 
          items={navigation.primary}
        />
      </NavigationMenuList>
    </NavigationMenu>
  );
};