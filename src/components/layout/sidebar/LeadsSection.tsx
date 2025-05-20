
import React from 'react';
import { FileText, Kanban } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const LeadsSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Forespørsler
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/leads"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <FileText size={16} />
          <span>Forespørsler</span>
        </NavLink>
        
        <NavLink
          to="/leads/kanban"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Kanban size={16} />
          <span>Kanban-tavle</span>
        </NavLink>
      </div>
    </div>
  );
};
