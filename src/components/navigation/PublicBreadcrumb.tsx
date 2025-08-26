import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  href: string;
  label: string;
  current?: boolean;
}

const routeLabels: Record<string, string> = {
  '/': 'Hjem',
  '/about': 'Om oss',
  '/contact': 'Kontakt',
  '/select-services': 'Velg tjenester',
  '/boligkjop': 'Boligkjøp',
};

export const PublicBreadcrumb = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Don't show breadcrumb on home page
  if (pathname === '/') return null;
  
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { href: '/', label: 'Hjem' }
  ];
  
  // Build breadcrumb trail
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    breadcrumbs.push({
      href: currentPath,
      label: routeLabels[currentPath] || segment,
      current: isLast
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-muted/30 py-3 border-b">
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
              {item.current ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    index === 0 && "flex items-center"
                  )}
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};