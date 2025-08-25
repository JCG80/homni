
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth';
import { getNavigation } from '@/config/navigation';

interface RoleBasedSectionProps {
  role: UserRole;
}

export const RoleBasedSection: React.FC<RoleBasedSectionProps> = ({ role }) => {
  const navItems = getNavigation(role);
  
  if (!navItems.length) return null;
  
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        {role.charAt(0).toUpperCase() + role.slice(1)} Meny
      </h2>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {Icon && <Icon size={16} />}
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
