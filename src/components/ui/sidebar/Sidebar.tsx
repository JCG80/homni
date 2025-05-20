
import React, { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends PropsWithChildren {
  className?: string;
  collapsed?: boolean;
}

/**
 * Base Sidebar component that provides the container for sidebar content
 * This component follows the design system guidelines with proper spacing,
 * accessibility attributes and responsive behavior
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  className,
  collapsed = false
}) => {
  return (
    <div 
      className={cn(
        "pb-12 h-screen overflow-y-auto border-r border-border bg-sidebar",
        collapsed ? "w-20" : "w-64",
        "transition-all duration-300 ease-in-out",
        className
      )}
      role="navigation"
      aria-label="Main Navigation"
    >
      {children}
    </div>
  );
};
