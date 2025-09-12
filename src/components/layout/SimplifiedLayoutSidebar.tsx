import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useQuickActions } from '@/hooks/navigation';

interface SimplifiedLayoutSidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const SimplifiedLayoutSidebar: React.FC<SimplifiedLayoutSidebarProps> = ({
  className,
  onItemClick
}) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const { quickActions } = useQuickActions();
  
  const currentRole = isAuthenticated ? role : 'guest';
  const navItems = getNavigation(currentRole as UserRole);
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };
  
  const getNotificationCount = (href: string) => {
    const quickAction = quickActions.find(action => action.href === href);
    return quickAction?.badge?.count || 0;
  };

  return (
    <nav className={cn("flex flex-col space-y-1 p-4", className)}>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const notificationCount = getNotificationCount(item.href);
        
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                active 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && typeof Icon === 'function' && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </div>
              
              {notificationCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};