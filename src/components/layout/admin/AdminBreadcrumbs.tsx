import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Admin', href: '/admin' }
    ];
    
    // Map path segments to readable labels
    const labelMap: Record<string, string> = {
      'admin': 'Admin',
      'dashboard': 'Dashboard',
      'leads': 'Leads',
      'companies': 'Bedrifter', 
      'members': 'Medlemmer',
      'feature-flags': 'Feature Flags',
      'roles': 'Roller',
      'system-modules': 'Systemmoduler',
      'api': 'API & Integrasjoner',
      'status': 'Systemstatus'
    };
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the first admin segment since it's already added
      if (index === 0 && segment === 'admin') return;
      
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === segments.length - 1;
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-300 mb-6">
      <Home className="h-4 w-4" />
      
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
          
          {crumb.href ? (
            <Link 
              to={crumb.href}
              className={cn(
                "hover:text-slate-900 dark:hover:text-white transition-colors",
                index === 0 && "font-medium"
              )}
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};