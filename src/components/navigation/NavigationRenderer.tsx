/**
 * Enhanced Navigation Renderer with i18n support
 * Renders navigation items with translation support and improved UX
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import type { NavigationItem } from '@/types/consolidated-types';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface NavigationRendererProps {
  items: NavigationItem[];
  variant?: 'vertical' | 'horizontal' | 'mobile';
  showIcons?: boolean;
  showDescriptions?: boolean;
  className?: string;
  onItemClick?: () => void;
}

export const NavigationRenderer: React.FC<NavigationRendererProps> = ({
  items,
  variant = 'vertical',
  showIcons = true,
  showDescriptions = false,
  className,
  onItemClick
}) => {
  const { t } = useI18n();
  const location = useLocation();
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const renderItem = (item: NavigationItem, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    // Translate title if it's a translation key
    const displayTitle = item.title.startsWith('navigation.') 
      ? t(item.title) 
      : item.title;

    const itemContent = (
      <motion.div
        initial={variant === 'mobile' ? { opacity: 0, x: -20 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group relative",
          variant === 'horizontal' && "inline-block"
        )}
      >
        <Link
          to={item.href}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            active && "bg-primary text-primary-foreground shadow-sm",
            variant === 'horizontal' && "px-4 py-2",
            variant === 'mobile' && "w-full justify-start",
            item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className
          )}
          aria-current={active ? 'page' : undefined}
        >
          {/* Icon */}
          {showIcons && Icon && typeof Icon === 'function' && (
            <Icon className={cn(
              "h-4 w-4 shrink-0",
              active && "text-primary-foreground",
              "group-hover:scale-110 transition-transform"
            )} />
          )}
          
          {/* Title and description */}
          <div className={cn(
            "flex-1 min-w-0",
            variant === 'horizontal' && "text-center"
          )}>
            <div className="font-medium truncate">
              {displayTitle}
            </div>
            {showDescriptions && item.description && (
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </div>
            )}
          </div>
          
          {/* Badge */}
          {item.badge && (
            <Badge 
              variant={active ? "secondary" : "outline"} 
              className="h-5 text-xs shrink-0"
            >
              {item.badge}
            </Badge>
          )}
          
          {/* Children indicator */}
          {hasChildren && (
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Link>
        
        {/* Children - only render for vertical variant */}
        {hasChildren && variant === 'vertical' && (
          <div className="ml-6 mt-1 space-y-1 border-l border-border/50 pl-3">
            {item.children!.map((child, childIndex) => (
              <div key={child.href}>
                {renderItem(child, childIndex)}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );

    return itemContent;
  };

  if (!items.length) return null;

  return (
    <nav className={cn(
      "space-y-1",
      variant === 'horizontal' && "flex space-y-0 space-x-1",
      variant === 'mobile' && "w-full",
      className
    )}>
      {items.map((item, index) => (
        <div key={item.href || item.title}>
          {renderItem(item, index)}
        </div>
      ))}
    </nav>
  );
};