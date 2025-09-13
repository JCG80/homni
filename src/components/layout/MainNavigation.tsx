import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  NavigationMenu, 
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import { useUnifiedNavigation } from '@/hooks/useUnifiedNavigation';
import { useAdaptiveNavigation } from '@/hooks/navigation/useAdaptiveNavigation';
import { CrossPlatformNavigation } from '@/components/navigation/CrossPlatformNavigation';

export const MainNavigation = () => {
  const { navigation, isLoading } = useUnifiedNavigation();
  const isMobile = useIsMobile();
  const { adaptiveConfig, deviceContext } = useAdaptiveNavigation();
  
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
  
  // Use enhanced cross-platform navigation for better UX
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <CrossPlatformNavigation 
          items={navigation.primary}
          variant="horizontal"
          density={adaptiveConfig.navigationDensity}
          enableAnimations={!deviceContext.isMobile}
        />
      </NavigationMenuList>
    </NavigationMenu>
  );
};