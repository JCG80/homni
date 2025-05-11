
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface RouteMap {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const routeMap: RouteMap = {
  '': { label: 'Hjem' },
  'dashboard': { label: 'Dashboard', parent: '' },
  'profile': { label: 'Min profil', parent: '' },
  'my-account': { label: 'Min konto', parent: '' },
  'strom': { label: 'Strømsammenligning', parent: '' },
  'forsikring': { label: 'Forsikring', parent: '' },
  'insurance': { label: 'Forsikring', parent: '' },
  'companies': { label: 'Selskaper', parent: 'insurance' },
  'compare': { label: 'Forsikringstilbud', parent: '' },
  'quote': { label: 'Få tilbud', parent: 'insurance' },
  'login': { label: 'Logg inn', parent: '' },
  'register': { label: 'Registrer deg', parent: '' },
  'leads': { label: 'Forespørsler', parent: '' },
  'lead-capture': { label: 'Ny forespørsel', parent: 'leads' },
  'select-services': { label: 'Velg tjenester', parent: '' },
};

export const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;
  
  // Build array of breadcrumb items
  const breadcrumbs = [];
  let currentPath = '';
  
  // Always add home
  breadcrumbs.push({
    label: 'Hjem',
    path: '/',
    isLast: pathSegments.length === 0
  });

  // Add path segments
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;
    
    // Get label from route map or capitalize segment
    const label = routeMap[segment]?.label || 
      segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      path: currentPath,
      isLast: i === pathSegments.length - 1
    });
  }
  
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            {crumb.isLast ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
