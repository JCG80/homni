
import React from 'react';
import { FileText, Database, Shield, Users, Building, Plug2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdminSectionProps {
  isMasterAdmin: boolean;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ isMasterAdmin }) => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Administrasjon
      </h2>
      <div className="space-y-1">
        <NavLink
          to="/admin/leads"
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
          <span>Leads</span>
        </NavLink>
        
        <NavLink
          to="/admin/system-modules"
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
          <span>Systemmoduler</span>
        </NavLink>

        <NavLink
          to="/admin/api"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Plug2 size={16} />
          <span>API &amp; Integrasjoner</span>
        </NavLink>
        
        {isMasterAdmin && (
          <>
            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Shield size={16} />
              <span>Rolleadministrasjon</span>
            </NavLink>
            
            <NavLink
              to="/admin/members"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Users size={16} />
              <span>Medlemmer</span>
            </NavLink>
            
            <NavLink
              to="/admin/companies"
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
              <span>Bedrifter</span>
            </NavLink>
            
            <NavLink
              to="/admin/internal-access"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Shield size={16} />
              <span>Modultilgang</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
