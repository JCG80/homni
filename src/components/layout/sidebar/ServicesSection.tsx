
import React from 'react';
import { Database, Building } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const ServicesSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Tjenester
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/select-services"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Database size={16} />
          <span>Velg tjenester</span>
        </NavLink>
        
        <NavLink
          to="/power-comparison"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Building size={16} />
          <span>Strøm</span>
        </NavLink>
      </div>
    </div>
  );
};
