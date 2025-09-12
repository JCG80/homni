/**
 * PHASE 1: Unified Mobile Navigation
 * Mobile-optimized navigation using unified navigation system
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useMobileNavigation } from '@/hooks/useUnifiedNavigation';
import { motion } from 'framer-motion';

interface UnifiedMobileNavigationProps {
  className?: string;
  onItemClick?: () => void; // Close menu callback
}

export const UnifiedMobileNavigation: React.FC<UnifiedMobileNavigationProps> = ({
  className,
  onItemClick
}) => {
  const { items, quickActions, isLoading } = useMobileNavigation();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleItemClick = () => {
    onItemClick?.();
  };

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {/* Main navigation items */}
      <div className="space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all",
                  active 
                    ? "text-primary-foreground bg-primary shadow-sm" 
                    : "text-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {Icon && (
                  <Icon className={cn(
                    "mr-3 h-5 w-5",
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                )}
                
                <span className="flex-1">{item.title}</span>
                
                {/* Badge for notifications */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                
                {typeof item.badge === 'string' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions section */}
      {quickActions.length > 0 && (
        <>
          <div className="px-4 py-2">
            <div className="h-px bg-border" />
          </div>
          
          <div className="space-y-1">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Hurtighandlinger
              </h3>
            </div>
            
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (items.length + index) * 0.05 }}
                >
                  <Link
                    to={action.href}
                    onClick={handleItemClick}
                    className="flex items-center px-4 py-3 rounded-md text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    {Icon && <Icon className="mr-3 h-4 w-4" />}
                    <span>{action.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
};