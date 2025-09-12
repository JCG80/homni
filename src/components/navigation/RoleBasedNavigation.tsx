
import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@/modules/auth/normalizeRole';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigationPreferences, useQuickActions } from '@/hooks/navigation';
import { Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NavItem } from '@/config/unifiedNavigation';

interface RoleBasedNavigationProps {
  className?: string;
  variant?: 'vertical' | 'horizontal';
  showBadges?: boolean;
  showFavoriteButtons?: boolean;
  items?: NavItem[]; // Allow passing custom items
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
  className,
  variant = 'vertical',
  showBadges = true,
  showFavoriteButtons = true,
  items // Use provided items or fall back to legacy navigation
}) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const { preferences, addFavoriteRoute, removeFavoriteRoute } = useNavigationPreferences();
  const { quickActions } = useQuickActions();
  
  const currentRole = isAuthenticated ? role : 'guest';
  
  // Use provided items or fall back to legacy navigation
  const navItems = items || getNavigation(currentRole as UserRole);
  
  // Convert NavItem[] to legacy format if needed
  const navigationItems = items ? items.map(item => ({
    href: item.href,
    title: item.title,
    icon: item.icon,
    badge: item.badge
  })) : navItems;
  
  // Get notification counts for navigation items
  const getNotificationCount = (href: string) => {
    const quickAction = quickActions.find(action => action.href === href);
    return quickAction?.badge?.count || 0;
  };
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };
  
  const isFavoriteRoute = (href: string) => {
    return preferences.favoriteRoutes.includes(href);
  };
  
  const toggleFavorite = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavoriteRoute(href)) {
      removeFavoriteRoute(href);
    } else {
      addFavoriteRoute(href);
    }
  };
  
  return (
    <nav className={cn(
      "flex",
      variant === 'vertical' ? "flex-col space-y-1" : "contents",
      className
    )}>
      <AnimatePresence>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const notificationCount = getNotificationCount(item.href);
          const isFavorite = isFavoriteRoute(item.href);
          
          // For horizontal navigation (used in NavigationMenu)
          if (variant === 'horizontal') {
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavigationMenuItem>
                  <Link
                    to={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      active && "bg-accent text-accent-foreground",
                      "relative"
                    )}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {item.title}
                    {showBadges && notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Link>
                </NavigationMenuItem>
              </motion.div>
            );
          }
          
          // For vertical navigation (sidebar style)
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-all relative",
                  active 
                    ? "text-primary-foreground bg-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav-item"
                    className="absolute inset-0 bg-primary rounded-md z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <div className="flex items-center flex-1 relative z-10">
                  {Icon && (
                    <Icon className={cn(
                      "mr-2 h-4 w-4",
                      active ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  )}
                  
                  <span className="flex-1">{item.title}</span>
                  
                  {/* Notification badge */}
                  {showBadges && notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </div>
                
                {/* Favorite button */}
                {showFavoriteButtons && isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "ml-2 h-6 w-6 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                      isFavorite && "opacity-100"
                    )}
                    onClick={(e) => toggleFavorite(item.href, e)}
                  >
                    <Star className={cn(
                      "h-3 w-3",
                      isFavorite && "fill-current text-yellow-500"
                    )} />
                  </Button>
                )}
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </nav>
  );
};
