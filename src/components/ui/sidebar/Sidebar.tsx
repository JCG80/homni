
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends PropsWithChildren {
  className?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Base Sidebar component that provides the container for sidebar content
 * This component follows the design system guidelines with proper spacing,
 * accessibility attributes and responsive behavior
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  className,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use controlled or uncontrolled collapsed state
  const sidebarCollapsed = collapsed !== undefined ? collapsed : isCollapsed;
  
  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768 && !sidebarCollapsed) {
        setIsCollapsed(true);
        onCollapsedChange?.(true);
      }
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onCollapsedChange, sidebarCollapsed]);
  
  // Toggle collapsed state
  const toggleCollapsed = () => {
    const newState = !sidebarCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };
  
  return (
    <>
      <div 
        className={cn(
          "pb-12 h-screen overflow-y-auto border-r border-border bg-sidebar",
          sidebarCollapsed ? "w-20" : "w-64",
          "transition-all duration-300 ease-in-out fixed md:static z-40",
          isMobile && sidebarCollapsed ? "-translate-x-full md:translate-x-0" : "",
          className
        )}
        role="navigation"
        aria-label="Main Navigation"
      >
        {children}
        
        <button
          onClick={toggleCollapsed}
          className={cn(
            "absolute right-0 top-4 transform translate-x-1/2 rounded-full p-1.5",
            "bg-primary text-primary-foreground shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            className={`transform transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
          >
            <path 
              d="M10 12L6 8L10 4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile overlay backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleCollapsed}
          aria-hidden="true"
        />
      )}
    </>
  );
};
