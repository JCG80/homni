import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export const Sidebar = () => {
  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <span>Oversikt</span>
            </NavLink>
          </div>
        </div>

        {/* Documentation section */}
        <div className="space-y-1">
          <h4 className="px-2 text-sm font-semibold">Dokumentasjon</h4>
          <div className="space-y-1">
            <NavLink
              to="/docs/project-plan"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <FileText size={16} />
              <span>Prosjektplan</span>
            </NavLink>
            {/* Add other documentation links here as needed */}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administrasjon
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <span>Brukere</span>
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <span>Innstillinger</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
