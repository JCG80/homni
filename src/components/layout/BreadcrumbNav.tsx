
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const BreadcrumbNav = () => {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    // Skip breadcrumbs on home page
    if (location.pathname === '/') {
      return [];
    }
    
    // Split the path into segments
    const segments = location.pathname.split('/').filter(Boolean);
    
    // Build breadcrumbs with path accumulation
    return segments.map((segment, index) => {
      // Build the path up to this segment
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the display label (capitalize, remove hyphens)
      let label = segment.replace(/-/g, ' ');
      
      // Handle special cases
      if (segment === 'dashboard') {
        label = 'Dashboard';
      } else if (segment.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
        // This is likely a UUID
        label = 'Detaljer';
      }
      
      // Capitalize
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      return { path, label };
    });
  }, [location.pathname]);
  
  // Don't render if we're on the home page or have no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Hjem</span>
          </Link>
        </li>
        
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link 
                to={crumb.path} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
