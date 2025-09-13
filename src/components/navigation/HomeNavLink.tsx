
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { motion } from 'framer-motion';
import { useAuth } from '@/modules/auth/hooks';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/modules/auth/normalizeRole';

export const HomeNavLink = () => {
  const { isAuthenticated, role } = useAuth();
  
  // For authenticated users, "Hjem" should lead to their dashboard
  const homeLink = isAuthenticated && role 
    ? routeForRole(role as UserRole)
    : "/";
  
  return (
    <NavigationMenuItem>
      <NavLink 
        to={homeLink} 
        className={({ isActive }) => 
          cn(
            navigationMenuTriggerStyle(), 
            "transition-all duration-300 flex items-center gap-2", 
            { 
              "bg-accent text-accent-foreground font-medium scale-105": isActive,
              "hover:bg-primary-50/80 hover:-translate-y-0.5": !isActive 
            }
          )
        }
      >
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Home className="h-4 w-4" />
        </motion.div>
        Hjem
      </NavLink>
    </NavigationMenuItem>
  );
};
