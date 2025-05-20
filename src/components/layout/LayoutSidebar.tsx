
import React, { ReactNode, CSSProperties } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from '@/hooks/use-toast';
import { 
  NavigationSection,
  RoleBasedSection,
  ServicesSection,
  LeadsSection,
  AdminSection,
  DocumentationSection,
  PartnersSection,
  AccountSection
} from './sidebar';
import { UserRole } from '@/modules/auth/utils/roles/types';

export interface LayoutSidebarProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  children, 
  className='', 
  style
}) => {
  const { isAuthenticated, role, logout } = useAuth();
  
  // Enhanced logging for debugging
  console.log("LayoutSidebar - Current auth state:", { isAuthenticated, role });
  
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
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
    }
  };
  
  return (
    <div className={`pb-12 ${className}`} style={style}>
      <div className="space-y-4 py-4">
        {/* Main navigation */}
        <NavigationSection />
        
        {/* Role-based navigation */}
        {isAuthenticated && role && (
          <RoleBasedSection role={role as UserRole} />
        )}
        
        {/* Services */}
        <ServicesSection />
        
        {/* Leads section for authenticated users */}
        {isAuthenticated && <LeadsSection />}
        
        {/* Admin section */}
        {isAuthenticated && (role === 'admin' || role === 'master_admin') && (
          <AdminSection isMasterAdmin={role === 'master_admin'} />
        )}
        
        {/* Documentation section */}
        <DocumentationSection />
        
        {/* Partners section */}
        <PartnersSection />
        
        {/* Logout for authenticated users */}
        {isAuthenticated && (
          <AccountSection onLogout={handleLogout} />
        )}
        
        {/* Render any children passed to the component */}
        {children}
      </div>
    </div>
  );
};

export default LayoutSidebar;
