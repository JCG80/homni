
import React from 'react';
import { SidebarNavSection, SidebarNavLink } from '@/components/ui/sidebar';
import { 
  Users, 
  FileText, 
  Shield, 
  Building, 
  Database, 
  LayoutDashboard, 
  Kanban, 
  Settings
} from 'lucide-react';
import { UserRole } from '@/modules/auth/utils/roles/types';

interface RoleBasedMenuProps {
  role: UserRole | null | string;
}

export const RoleBasedMenu: React.FC<RoleBasedMenuProps> = ({ role }) => {
  // Member menu items
  const renderMemberMenu = () => (
    <SidebarNavSection title="Min konto">
      <SidebarNavLink to="/profile" icon={Users}>Min profil</SidebarNavLink>
      <SidebarNavLink to="/dashboard/properties" icon={Building}>Mine eiendommer</SidebarNavLink>
      <SidebarNavLink to="/dashboard/documents" icon={FileText}>Dokumenter</SidebarNavLink>
    </SidebarNavSection>
  );
  
  // Company menu items
  const renderCompanyMenu = () => (
    <>
      <SidebarNavSection title="Min bedrift">
        <SidebarNavLink to="/profile" icon={Users}>Min profil</SidebarNavLink>
        <SidebarNavLink to="/dashboard/leads" icon={FileText}>Forespørsler</SidebarNavLink>
        <SidebarNavLink to="/dashboard/leads/kanban" icon={Kanban}>Kanban-tavle</SidebarNavLink>
        <SidebarNavLink to="/dashboard/analytics" icon={LayoutDashboard}>Analyse</SidebarNavLink>
      </SidebarNavSection>
    </>
  );
  
  // Content editor menu items
  const renderContentEditorMenu = () => (
    <SidebarNavSection title="Innhold">
      <SidebarNavLink to="/dashboard/content" icon={FileText}>Innholdsredigering</SidebarNavLink>
      <SidebarNavLink to="/dashboard/media" icon={FileText}>Media</SidebarNavLink>
    </SidebarNavSection>
  );
  
  // Admin menu items
  const renderAdminMenu = () => (
    <SidebarNavSection title="Administrasjon">
      <SidebarNavLink to="/admin/leads" icon={FileText}>Leads</SidebarNavLink>
      <SidebarNavLink to="/admin/system-modules" icon={Database}>Systemmoduler</SidebarNavLink>
      <SidebarNavLink to="/admin/settings" icon={Settings}>Innstillinger</SidebarNavLink>
    </SidebarNavSection>
  );
  
  // Master admin menu items (extends admin)
  const renderMasterAdminMenu = () => (
    <>
      <SidebarNavSection title="Administrasjon">
        <SidebarNavLink to="/admin/leads" icon={FileText}>Leads</SidebarNavLink>
        <SidebarNavLink to="/admin/system-modules" icon={Database}>Systemmoduler</SidebarNavLink>
        <SidebarNavLink to="/admin/roles" icon={Shield}>Rolleadministrasjon</SidebarNavLink>
        <SidebarNavLink to="/admin/members" icon={Users}>Medlemmer</SidebarNavLink>
        <SidebarNavLink to="/admin/companies" icon={Building}>Bedrifter</SidebarNavLink>
        <SidebarNavLink to="/admin/internal-access" icon={Shield}>Modultilgang</SidebarNavLink>
        <SidebarNavLink to="/admin/settings" icon={Settings}>Innstillinger</SidebarNavLink>
      </SidebarNavSection>
    </>
  );

  // Display different menu items based on the user's role
  if (!role) return null;

  switch (role) {
    case 'member':
      return renderMemberMenu();
    case 'company':
      return renderCompanyMenu();
    case 'content_editor':
      return (
        <>
          {renderContentEditorMenu()}
        </>
      );
    case 'admin':
      return (
        <>
          {renderAdminMenu()}
          {renderContentEditorMenu()}
        </>
      );
    case 'master_admin':
      return (
        <>
          {renderMasterAdminMenu()}
          {renderContentEditorMenu()}
        </>
      );
    default:
      return null;
  }
};
