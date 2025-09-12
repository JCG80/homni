import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';
import { Badge } from '@/components/ui/badge';
import { useQuickActions } from '@/hooks/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MobileBottomNavigationProps {
  className?: string;
  maxItems?: number;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  className,
  maxItems = 5
}) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const { quickActions } = useQuickActions();
  
  const currentRole = isAuthenticated ? (role as UserRole) : 'guest';
  const navItems = getNavigation(currentRole).slice(0, maxItems);
  
  const getNotificationCount = (href: string) => {
    const quickAction = quickActions.find(action => action.href === href);
    return quickAction?.badge?.count || 0;
  };
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  if (navItems.length === 0) return null;

  return (
    <motion.nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t',
        className
      )}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const notificationCount = getNotificationCount(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs relative transition-colors',
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                 {Icon && typeof Icon === 'function' && (
                   <Icon className={cn(
                     'h-5 w-5 mb-1',
                     active && 'text-primary'
                   )} />
                 )}
                
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </motion.div>
              
              <span className={cn(
                'font-medium truncate max-w-full leading-tight',
                active && 'text-primary'
              )}>
                {item.title}
              </span>
              
              {active && (
                <motion.div
                  layoutId="mobile-active-indicator"
                  className="absolute -top-px left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};