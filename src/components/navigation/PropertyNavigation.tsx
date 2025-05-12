
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';

interface PropertyServiceItem {
  title: string;
  description: string;
  path: string;
}

export const PropertyNavigation = () => {
  // Property services data
  const propertyServices = [
    { title: 'Eiendommer', description: 'Administrér dine eiendommer', path: '/properties' },
    { title: 'Boligkjøp', description: 'Råd og verktøy for boligkjøp', path: '/boligkjop' },
  ];
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Home className="h-4 w-4 mr-2" />
        Bolig
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-1">
          {propertyServices.map((service) => (
            <NavLink key={service.title} to={service.path} 
              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
            >
              <div className="mb-2 mt-4 text-lg font-medium">{service.title}</div>
              <p className="text-sm leading-tight text-muted-foreground">
                {service.description}
              </p>
            </NavLink>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
