
import React from 'react';
import { HelpCircle, FileText, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const SupportSection = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Hjelp og støtte
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/help"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )
          }
          aria-label="Help and Documentation"
        >
          <HelpCircle size={16} />
          <span>Hjelpesenter</span>
        </NavLink>
        
        <NavLink
          to="/documentation"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )
          }
          aria-label="Documentation"
        >
          <FileText size={16} />
          <span>Dokumentasjon</span>
        </NavLink>
        
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )
          }
          aria-label="Contact Support"
        >
          <MessageCircle size={16} />
          <span>Kontakt oss</span>
        </NavLink>
      </div>
    </div>
  );
};
