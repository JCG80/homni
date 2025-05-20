
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Building } from 'lucide-react';

export const PartnersSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Partnere
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/companies"
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
          <span>Alle partnere</span>
        </NavLink>
      </div>
    </div>
  );
};
