/**
 * AppSidebar - Unified sidebar using Shadcn sidebar component
 * Part of navigation consolidation - Phase 3
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { cn } from '@/lib/utils';
import { User, LogOut } from 'lucide-react';

export function AppSidebar() {
  const { navigation, isLoading } = useModuleNavigation();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path === '/') return false;
    return currentPath.startsWith(path);
  };

  const isCollapsed = state === 'collapsed';

  if (isLoading) {
    return (
      <Sidebar className="w-64">
        <SidebarContent>
          <div className="space-y-2 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Homni
            </h2>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hovedmeny</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.primary.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href}>
                        {Icon && typeof Icon === 'function' && (
                          <Icon className="h-4 w-4" />
                        )}
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navigation.secondary.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Innstillinger</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.secondary.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <NavLink to={item.href}>
                          {Icon && typeof Icon === 'function' && (
                            <Icon className="h-4 w-4" />
                          )}
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/profile">
                  <User className="h-4 w-4" />
                  {!isCollapsed && <span>Profil</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout?.()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Logg ut</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}