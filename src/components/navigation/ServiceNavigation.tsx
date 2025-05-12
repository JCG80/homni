
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, Zap, Link as LinkIcon, Phone, Map, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceNavigationProps {
  variant?: 'horizontal' | 'vertical';
  userType?: 'private' | 'business';
}

export const ServiceNavigation: React.FC<ServiceNavigationProps> = ({ 
  variant = 'horizontal', 
  userType = 'private' 
}) => {
  const services = [
    {
      id: 'property',
      name: userType === 'private' ? 'Bolig' : 'Eiendom',
      icon: Home,
      path: '/properties',
      description: 'Administrer dine eiendommer',
    },
    {
      id: 'insurance',
      name: 'Forsikring',
      icon: Shield,
      path: '/forsikring/companies',
      description: 'Sammenlign forsikringsselskaper',
    },
    {
      id: 'energy',
      name: 'Strøm',
      icon: Zap,
      path: '/strom',
      description: 'Finn beste strømavtale',
    },
    {
      id: 'broadband',
      name: 'Bredbånd',
      icon: LinkIcon,
      path: '/bredband',
      description: 'Sammenlign bredbåndleverandører',
    },
    {
      id: 'mobile',
      name: 'Mobil',
      icon: Phone,
      path: '/mobil',
      description: 'Finn beste mobilabonnement',
    },
  ];

  // For businesses, replace some services with business-specific ones
  const businessServices = userType === 'business' ? [
    {
      id: 'marina',
      name: 'Marina',
      icon: Map,
      path: '/marina',
      description: 'Administrer havneområder',
    },
    {
      id: 'documents',
      name: 'Dokumenter',
      icon: FileText,
      path: '/documents',
      description: 'Viktige dokumenter',
    },
  ] : [];

  const finalServices = userType === 'business' 
    ? [...services.slice(0, 3), ...businessServices] 
    : services;

  if (variant === 'vertical') {
    return (
      <div className="space-y-1">
        {finalServices.map(service => (
          <NavLink 
            key={service.id}
            to={service.path}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary"
            )}
          >
            <service.icon className="h-4 w-4 mr-2" />
            {service.name}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {finalServices.map(service => (
        <Button 
          key={service.id}
          variant="outline"
          className="flex items-center"
          asChild
        >
          <NavLink to={service.path}>
            <service.icon className="h-4 w-4 mr-2" />
            {service.name}
          </NavLink>
        </Button>
      ))}
    </div>
  );
};
