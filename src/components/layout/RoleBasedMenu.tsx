import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  SidebarContent, 
  SidebarNavSection, 
  SidebarNavLink 
} from '@/components/ui/sidebar';
import { getNavigation } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';

interface RoleBasedMenuProps {
  role: string;
}

export const RoleBasedMenu: React.FC<RoleBasedMenuProps> = ({ role }) => {
  // Get the navigation items for this role
  const navItems = getNavigation(role as UserRole);
  
  return (
    <SidebarNavSection title={`${role.charAt(0).toUpperCase() + role.slice(1)} Meny`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarNavLink 
            key={item.href} 
            to={item.href} 
            icon={Icon}
            end={item.href === '/'}
          >
            {item.title}
          </SidebarNavLink>
        );
      })}
    </SidebarNavSection>
  );
};
