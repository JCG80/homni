
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Settings, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './SidebarContent';
import { SidebarNavSection } from './SidebarNavSection';
import { SidebarNavLink } from './SidebarNavLink';
import { SidebarNavItem } from './SidebarNavItem';
import { ServiceNavigation } from '@/components/navigation/ServiceNavigation';

export const Sidebar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  
  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      // Fallback hvis logout-funksjonen ikke er tilgjengelig
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="pb-12">
      <SidebarContent>
        {/* Main navigation */}
        <SidebarNavSection title="Navigasjon">
          <SidebarNavLink to="/" icon={Home} end>Hjem</SidebarNavLink>
        </SidebarNavSection>
        
        {/* Services navigation - using the standard component */}
        <SidebarNavSection title="Tjenester">
          <div className="px-3 py-2">
            <ServiceNavigation variant="vertical" />
          </div>
        </SidebarNavSection>

        {/* Authenticated menu items */}
        {isAuthenticated && (
          <>
            <SidebarNavSection title="Min konto">
              {/* Direkte lenking til spesifikke dashboards basert på rolle */}
              {role && (
                <SidebarNavLink to={`/dashboard/${role}`} icon={LayoutDashboard}>Dashboard</SidebarNavLink>
              )}
              <SidebarNavLink to="/profile" icon={Users}>Min profil</SidebarNavLink>
              <SidebarNavLink to="/leads" icon={FileText}>Forespørsler</SidebarNavLink>
            </SidebarNavSection>
            
            {/* Admin section */}
            {(role === 'admin' || role === 'master_admin') && (
              <SidebarNavSection title="Administrasjon">
                <SidebarNavLink to="/admin/leads" icon={FileText}>Leads</SidebarNavLink>
                <SidebarNavLink to="/admin/system-modules" icon={Settings}>Systemmoduler</SidebarNavLink>
                
                {role === 'master_admin' && (
                  <>
                    <SidebarNavLink to="/admin/roles" icon={Users}>Roller</SidebarNavLink>
                    <SidebarNavLink to="/admin/members" icon={Users}>Brukere</SidebarNavLink>
                  </>
                )}
              </SidebarNavSection>
            )}
            
            {/* Logout button */}
            <div className="px-3 py-2">
              <SidebarNavItem icon={LogOut} onClick={handleLogout}>
                Logg ut
              </SidebarNavItem>
            </div>
          </>
        )}

        {/* Documentation section */}
        <SidebarNavSection title="Dokumentasjon">
          <SidebarNavLink to="/docs/project-plan" icon={FileText}>Prosjektplan</SidebarNavLink>
        </SidebarNavSection>
      </SidebarContent>
    </div>
  );
};
