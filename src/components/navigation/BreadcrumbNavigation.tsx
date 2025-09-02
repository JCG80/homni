import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNavigation } from '@/config/navigation';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/utils/roles/types';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className,
  showHome = true,
  maxItems = 5,
}) => {
  const location = useLocation();
  const { role } = useAuth();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
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

    // Build breadcrumbs from path segments
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

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single items
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            )}
            
            {breadcrumb.label === '...' ? (
              <span className="px-2 py-1 text-muted-foreground/70">
                ...
              </span>
            ) : breadcrumb.isActive ? (
              <span 
                className="px-2 py-1 font-medium text-foreground"
                aria-current="page"
              >
                {index === 0 && showHome ? (
                  <Home className="h-4 w-4" />
                ) : (
                  breadcrumb.label
                )}
              </span>
            ) : (
              <Link
                to={breadcrumb.href}
                className={cn(
                  "px-2 py-1 rounded hover:text-foreground hover:bg-accent/50 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                {index === 0 && showHome ? (
                  <Home className="h-4 w-4" />
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