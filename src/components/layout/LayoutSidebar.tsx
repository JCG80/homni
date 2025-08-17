
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
import { motion } from 'framer-motion';

export interface LayoutSidebarProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  children, 
  className = '', 
  style
}) => {
  const { isAuthenticated, role, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
        toast({
          title: "Utlogget",
          description: "Du har blitt logget ut av systemet",
        });
      } else {
        toast({
          title: "Utloggingsfeil",
          description: "Kunne ikke logge ut på normal måte. Prøver alternativ metode.",
          variant: "destructive"
        });
        // Fallback if logout function is not available
        window.location.href = '/login';
      }
    } catch (error) {
      toast({
        title: "Utloggingsfeil",
        description: "En feil oppstod under utlogging.",
        variant: "destructive"
      });
    }
  };
  
  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className={`pb-12 h-full flex flex-col ${className}`} 
      style={style}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-4 py-4 flex-grow flex flex-col">
        {/* Main navigation */}
        <motion.div variants={sectionVariants}>
          <NavigationSection />
        </motion.div>
        
        {/* Role-based navigation */}
        {isAuthenticated && role && (
          <motion.div variants={sectionVariants}>
            <RoleBasedSection role={role as UserRole} />
          </motion.div>
        )}
        
        {/* Services */}
        <motion.div variants={sectionVariants}>
          <ServicesSection />
        </motion.div>
        
        {/* Leads section for authenticated users */}
        {isAuthenticated && (
          <motion.div variants={sectionVariants}>
            <LeadsSection />
          </motion.div>
        )}
        
        {/* Admin section */}
        {isAuthenticated && (role === 'admin' || role === 'master_admin') && (
          <motion.div variants={sectionVariants}>
            <AdminSection isMasterAdmin={role === 'master_admin'} />
          </motion.div>
        )}
        
        {/* Documentation section */}
        <motion.div variants={sectionVariants}>
          <DocumentationSection />
        </motion.div>
        
        {/* Partners section */}
        <motion.div variants={sectionVariants}>
          <PartnersSection />
        </motion.div>
        
        {/* Render any children passed to the component */}
        {children}
        
        {/* Account section / Logout for authenticated users */}
        {isAuthenticated && (
          <motion.div variants={sectionVariants} className="mt-auto">
            <AccountSection onLogout={handleLogout} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LayoutSidebar;
