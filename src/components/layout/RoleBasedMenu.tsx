import React from 'react';
import { 
  SidebarGroup,
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { getConsolidatedNavigation } from '@/config/navigation-consolidated';
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/modules/auth/normalizeRole';

interface RoleBasedMenuProps {
  role: string;
}

export const RoleBasedMenu: React.FC<RoleBasedMenuProps> = ({ role }) => {
  // Get the navigation items for this role
  const navConfig = getConsolidatedNavigation(role as UserRole);
  const navItems = navConfig.primary;
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{`${role.charAt(0).toUpperCase() + role.slice(1)} Meny`}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.href}
                    end={item.href === '/'}
                  >
                    {typeof Icon === 'function' && <Icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
