
import React, { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, LayoutDashboard, Users, Settings, LogOut, FileText, 
  Database, Shield, Building, Coins, HelpCircle, Kanban
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { SidebarContent } from './SidebarContent';
import { SidebarNavSection } from './SidebarNavSection';
import { SidebarNavLink } from './SidebarNavLink';
import { SidebarNavItem } from './SidebarNavItem';
import { ServiceNavigation } from '@/components/navigation/ServiceNavigation';
import { toast } from '@/hooks/use-toast';

export const Sidebar: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { isAuthenticated, role, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // Enhanced logging for debugging
  console.log("Sidebar - Current auth state:", { isAuthenticated, role });
  
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
        toast({
          title: "Logget ut",
          description: "Du er nå logget ut av systemet",
        });
      } else {
        console.error('Logout function is not available');
        toast({
          title: "Utloggingsfeil",
          description: "Kunne ikke logge ut på normal måte. Prøver alternativ metode.",
          variant: "destructive"
        });
        // Fallback if logout function is not available
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Feil ved utlogging",
        description: "Det oppstod en feil ved utlogging. Prøv igjen.",
        variant: "destructive"
      });
    }
  };
  
  // Get correct dashboard route based on role
  const getDashboardRoute = () => {
    if (!role) {
      console.log("Sidebar - No role detected, using default dashboard route");
      return "/dashboard";
    }
    const route = `/dashboard/${role}`;
    console.log(`Sidebar - Using role-specific dashboard route: ${route}`);
    return route;
  };
  
  const dashboardRoute = getDashboardRoute();
  
  return (
    <div className="pb-12">
      {children ? children : (
        <SidebarContent>
          {/* Main navigation */}
          <SidebarNavSection title="Navigasjon">
            <SidebarNavLink to="/" icon={Home} end>Hjem</SidebarNavLink>
            {isAuthenticated && (
              <SidebarNavLink to={dashboardRoute} icon={LayoutDashboard}>Dashboard</SidebarNavLink>
            )}
          </SidebarNavSection>
          
          {/* Services navigation - using the standard component */}
          <SidebarNavSection title="Tjenester">
            <SidebarNavLink to="/select-services" icon={Database}>Velg tjenester</SidebarNavLink>
            <SidebarNavLink to="/forsikring" icon={Shield}>Forsikring</SidebarNavLink>
            <SidebarNavLink to="/strom" icon={Building}>Strøm</SidebarNavLink>
            <div className="px-3 py-2">
              <ServiceNavigation variant="vertical" />
            </div>
          </SidebarNavSection>

          {/* Authenticated menu items */}
          {isAuthenticated && (
            <>
              <SidebarNavSection title="Min konto">
                <SidebarNavLink to="/profile" icon={Users}>
                  Min profil
                </SidebarNavLink>
                <SidebarNavLink to="/leads" icon={FileText}>
                  Forespørsler
                </SidebarNavLink>
                <SidebarNavLink to="/leads/kanban" icon={Kanban}>
                  Kanban-tavle
                </SidebarNavLink>
              </SidebarNavSection>
              
              {/* Admin section */}
              {(role === 'admin' || role === 'master_admin') && (
                <SidebarNavSection title="Administrasjon">
                  <SidebarNavLink to="/admin/leads" icon={FileText}>Leads</SidebarNavLink>
                  <SidebarNavLink to="/admin/system-modules" icon={Database}>Systemmoduler</SidebarNavLink>
                  
                  {role === 'master_admin' && (
                    <>
                      <SidebarNavLink to="/admin/roles" icon={Shield}>Rolleadministrasjon</SidebarNavLink>
                      <SidebarNavLink to="/admin/members" icon={Users}>Medlemmer</SidebarNavLink>
                      <SidebarNavLink to="/admin/companies" icon={Users}>Bedrifter</SidebarNavLink>
                      <SidebarNavLink to="/admin/internal-access" icon={Shield}>Modultilgang</SidebarNavLink>
                    </>
                  )}
                </SidebarNavSection>
              )}

              {/* Content editor section */}
              {(role === 'content_editor' || role === 'admin' || role === 'master_admin') && (
                <SidebarNavSection title="Innhold">
                  <SidebarNavLink to="/admin/content" icon={FileText}>Innholdsredigering</SidebarNavLink>
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
            <SidebarNavLink to="/docs/faq" icon={HelpCircle}>FAQ</SidebarNavLink>
          </SidebarNavSection>

          {/* Companies section */}
          <SidebarNavSection title="Partnere">
            <SidebarNavLink to="/companies" icon={Building}>Våre partnere</SidebarNavLink>
          </SidebarNavSection>
        </SidebarContent>
      )}
    </div>
  );
};
