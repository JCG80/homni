
import React, { PropsWithChildren } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { Sidebar, SidebarContent, SidebarNavSection, SidebarNavLink } from '@/components/ui/sidebar';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Building, 
  FileText, 
  Settings, 
  Shield, 
  Kanban,
  Database
} from 'lucide-react';
import { RoleBasedMenu } from './RoleBasedMenu';
import { toast } from '@/hooks/use-toast';

// Use PropsWithChildren to properly type the children prop
export const AppSidebar = ({ children }: PropsWithChildren<{}>) => {
  const { isAuthenticated, role, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
        toast({
          title: "Logget ut",
          description: "Du er nå logget ut av systemet",
        });
      } else {
        toast({
          title: "Utloggingsfeil",
          description: "Kunne ikke logge ut på normal måte.",
          variant: "destructive"
        });
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
  
  return (
    <Sidebar>
      <SidebarContent>
        {/* Main navigation */}
        <SidebarNavSection title="Navigasjon">
          <SidebarNavLink to="/" icon={Home} end>Hjem</SidebarNavLink>
          {isAuthenticated && (
            <SidebarNavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarNavLink>
          )}
        </SidebarNavSection>
        
        {/* Role-based menu items - Only render when there's a valid role */}
        {isAuthenticated && role && (
          <RoleBasedMenu role={role} />
        )}
        
        {/* Documentation section */}
        <SidebarNavSection title="Dokumentasjon">
          <SidebarNavLink to="/docs/project-plan" icon={FileText}>Prosjektplan</SidebarNavLink>
        </SidebarNavSection>

        {/* Partners section */}
        <SidebarNavSection title="Partnere">
          <SidebarNavLink to="/companies" icon={Building}>Våre partnere</SidebarNavLink>
        </SidebarNavSection>
        
        {/* Logout for authenticated users */}
        {isAuthenticated && (
          <SidebarNavSection title="Konto">
            <SidebarNavLink to="#" icon={Settings} onClick={handleLogout}>
              Logg ut
            </SidebarNavLink>
          </SidebarNavSection>
        )}
        
        {/* Render any children passed to the component */}
        {children}
      </SidebarContent>
    </Sidebar>
  );
};
