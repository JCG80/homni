
import React from 'react';
import { FileText, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const DocumentationSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Dokumentasjon
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/docs/project-plan"
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
          <span>Prosjektplan</span>
        </NavLink>
        
        <NavLink
          to="/docs/faq"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <HelpCircle size={16} />
          <span>FAQ</span>
        </NavLink>
      </div>
    </div>
  );
};
