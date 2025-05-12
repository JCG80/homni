
import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarNavLinkProps extends Omit<NavLinkProps, 'className'> {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export const SidebarNavLink = ({ to, icon: Icon, children, end = false, className, ...rest }: SidebarNavLinkProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )
      }
      {...rest}
    >
      <Icon size={16} />
      <span>{children}</span>
    </NavLink>
  );
};
