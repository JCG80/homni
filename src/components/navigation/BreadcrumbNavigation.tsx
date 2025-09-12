import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBreadcrumbs, getNavigation } from '@/config/navigation-consolidated';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/normalizeRole';
import { useIsMobile } from '@/hooks/use-mobile';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
  showOnMobile?: boolean;
  customItems?: BreadcrumbItem[];
  variant?: 'default' | 'compact' | 'minimal';
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className,
  showHome = true,
  maxItems = 5,
  showOnMobile = false,
  customItems,
  variant = 'default',
}) => {
  const location = useLocation();
  const { role } = useAuth();
  const isMobile = useIsMobile();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Return custom items if provided
    if (customItems) {
      return customItems;
    }

    // Skip breadcrumbs on home page unless explicitly requested
    if (location.pathname === '/' && !showHome) {
      return [];
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const navigation = getNavigation(role as UserRole);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if requested
    if (showHome) {
      breadcrumbs.push({
        label: 'Forside',
        href: '/',
        isActive: location.pathname === '/',
      });
    }

    // Use getBreadcrumbs from navigation config for role-aware breadcrumbs
    const navBreadcrumbs = getBreadcrumbs(location.pathname, role as UserRole);
    if (navBreadcrumbs.length > 0) {
      navBreadcrumbs.forEach(navItem => {
        breadcrumbs.push({
          label: navItem.title,
          href: navItem.href,
          isActive: navItem.href === location.pathname,
        });
      });
    } else {
      // Fallback: Build breadcrumbs from path segments
      let currentPath = '';
      
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        // Find matching navigation item
        const navItem = navigation.find(nav => 
          nav.href === currentPath || 
          nav.href.includes(segment) ||
          nav.children?.some(child => child.href === currentPath)
        );

        // Generate label
        let label = navItem?.title || formatSegment(segment);
        
        // Special handling for dynamic routes
        if (!navItem) {
          label = getContextualLabel(currentPath, segment);
        }

        breadcrumbs.push({
          label,
          href: currentPath,
          isActive: isLast,
        });
      });
    }

    // Apply mobile-specific trimming
    if (isMobile && variant === 'compact') {
      if (breadcrumbs.length > 3) {
        const first = breadcrumbs[0];
        const last = breadcrumbs[breadcrumbs.length - 1];
        return [first, { label: '...', href: '', isActive: false }, last];
      }
    }

    // Limit number of items
    if (breadcrumbs.length > maxItems) {
      const startItems = breadcrumbs.slice(0, 1); // Keep home
      const endItems = breadcrumbs.slice(-(maxItems - 2)); // Keep last items
      
      return [
        ...startItems,
        { label: '...', href: '', isActive: false },
        ...endItems,
      ];
    }

    return breadcrumbs;
  };

  const formatSegment = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getContextualLabel = (path: string, segment: string): string => {
    // Special cases for known routes
    const contextualLabels: Record<string, string> = {
      'admin': 'Administrasjon',
      'dashboard': 'Dashboard',
      'leads': 'Leads',
      'property': 'Eiendom',
      'sales': 'Salg',
      'documents': 'Dokumenter',
      'manage': 'Administrer',
      'distribution': 'Distribusjon',
      'kanban': 'Kanban',
      'pipeline': 'Pipeline',
      'portfolio': 'Portefølje',
      'setup': 'Oppsett',
      'marketing': 'Markedsføring',
      'expenses': 'Utgifter',
      'cms': 'Innholdsstyring',
      'artikler': 'Artikler',
      'preview': 'Forhåndsvisning',
    };

    return contextualLabels[segment] || formatSegment(segment);
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if no breadcrumbs or on mobile (unless explicitly requested)
  if (breadcrumbs.length <= (showHome ? 1 : 0) || (isMobile && !showOnMobile && variant !== 'compact')) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return "text-xs text-muted-foreground/60";
      case 'compact':
        return "text-sm space-x-0.5";
      default:
        return "text-sm space-x-1";
    }
  };

  return (
    <nav 
      className={cn(
        "flex items-center text-muted-foreground",
        getVariantStyles(),
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className={cn(
                "text-muted-foreground/50 mx-1",
                variant === 'compact' ? "h-3 w-3" : "h-4 w-4"
              )} />
            )}
            
            {breadcrumb.label === '...' ? (
              <span className="px-2 py-1 text-muted-foreground/70">
                ...
              </span>
            ) : breadcrumb.isActive ? (
              <span 
                className={cn(
                  "font-medium text-foreground",
                  variant !== 'minimal' && "px-2 py-1"
                )}
                aria-current="page"
              >
                {index === 0 && showHome ? (
                  <Home className={variant === 'compact' ? "h-3 w-3" : "h-4 w-4"} />
                ) : (
                  breadcrumb.label
                )}
              </span>
            ) : (
              <Link
                to={breadcrumb.href}
                className={cn(
                  "rounded hover:text-foreground hover:bg-accent/50 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  variant !== 'minimal' && "px-2 py-1"
                )}
              >
                {index === 0 && showHome ? (
                  <Home className={variant === 'compact' ? "h-3 w-3" : "h-4 w-4"} />
                ) : (
                  breadcrumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;