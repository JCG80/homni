
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';

interface ServiceItem {
  title: string;
  description: string;
  path: string;
}

export const ServicesNavigation = () => {
  // Utility services data
  const utilityServices = [
    { title: 'Strøm', description: 'Sammenlign strømpriser og finn den beste avtalen', path: '/strom' },
    { title: 'Bredbånd', description: 'Finn den raskeste og beste løsningen', path: '/bredband' },
  ];
  
  // Insurance services data
  const insuranceServices = [
    { title: 'Forsikringssammenligning', description: 'Sammenlign forsikringsselskaper', path: '/forsikring/companies' },
    { title: 'Forsikringstilbud', description: 'Få tilbud på forsikring', path: '/forsikring/quote' },
  ];
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <LayoutGrid className="h-4 w-4 mr-2" />
        Tjenester
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2">
          {utilityServices.map((service) => (
            <NavLink key={service.title} to={service.path} 
              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
            >
              <div className="mb-2 mt-4 text-lg font-medium">{service.title}</div>
              <p className="text-sm leading-tight text-muted-foreground">
                {service.description}
              </p>
            </NavLink>
          ))}
          
          {insuranceServices.map((service) => (
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
