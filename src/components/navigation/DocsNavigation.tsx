
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, HelpCircle } from 'lucide-react';
import { 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';

interface DocItem {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
}

export const DocsNavigation = () => {
  // Documentation items
  const docItems: DocItem[] = [
    { 
      title: 'Prosjektplan', 
      description: 'Les om våre planer for plattformen', 
      path: '/docs/project-plan',
      icon: FileText
    },
    { 
      title: 'FAQ', 
      description: 'Ofte stilte spørsmål om tjenestene våre', 
      path: '/docs/faq',
      icon: HelpCircle
    }
  ];
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <FileText className="h-4 w-4 mr-2" />
        Dokumentasjon
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-3 p-4 w-[400px] md:w-[500px] grid-cols-1">
          {docItems.map((item) => (
            <NavLink key={item.title} to={item.path} 
              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
            >
              <div className="flex items-center mb-2">
                <item.icon className="h-5 w-5 mr-2 text-primary" />
                <span className="text-lg font-medium">{item.title}</span>
              </div>
              <p className="text-sm leading-tight text-muted-foreground">
                {item.description}
              </p>
            </NavLink>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
