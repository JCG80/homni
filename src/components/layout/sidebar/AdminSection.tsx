
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navControl } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';

interface AdminSectionProps {
  isMasterAdmin: boolean;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ isMasterAdmin }) => {
  const role: UserRole = isMasterAdmin ? 'master_admin' : 'admin';
  const navigationItems = navControl[role];

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Administrasjon
      </h2>
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {IconComponent && typeof IconComponent === 'function' && <IconComponent size={16} />}
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
