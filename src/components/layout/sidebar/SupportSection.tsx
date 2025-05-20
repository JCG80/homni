
import React from 'react';
import { HelpCircle, FileText, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarNavSection } from '@/components/ui/sidebar/SidebarNavSection';

export const SupportSection = () => {
  return (
    <SidebarNavSection title="Hjelp og støtte">
      <div className="space-y-1">
        <NavLink
          to="/help"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )
          }
          aria-label="Help and Documentation"
        >
          <HelpCircle size={16} />
          <span className="truncate">Hjelpesenter</span>
        </NavLink>
        
        <NavLink
          to="/documentation"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )
          }
          aria-label="Documentation"
        >
          <FileText size={16} />
          <span className="truncate">Dokumentasjon</span>
        </NavLink>
        
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )
          }
          aria-label="Contact Support"
        >
          <MessageCircle size={16} />
          <span className="truncate">Kontakt oss</span>
        </NavLink>
      </div>
    </SidebarNavSection>
  );
};
