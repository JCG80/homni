
import React from 'react';
import { Home, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const NavigationSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Navigasjon
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Home size={16} />
          <span>Hjem</span>
        </NavLink>
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
      </div>
    </div>
  );
};
