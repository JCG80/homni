
import React, { ReactNode, CSSProperties } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Building, 
  FileText, 
  Settings, 
  Shield, 
  Kanban,
  Database,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getNavigation } from '@/config/navigation';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { toast } from '@/hooks/use-toast';

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
  const { isAuthenticated, role, logout, hasRole } = useAuth();
  
  // Enhanced logging for debugging
  console.log("LayoutSidebar - Current auth state:", { isAuthenticated, role });
  
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
  
  // Get role-specific navigation items
  const navItems = role ? getNavigation(role as UserRole) : [];
  
  return (
    <div className={`pb-12 ${className}`} style={style}>
      <div className="space-y-4 py-4">
        {/* Main navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigasjon
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Home size={16} />
              <span>Hjem</span>
            </NavLink>
            
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
            )}
          </div>
        </div>
        
        {/* Role-based navigation */}
        {isAuthenticated && role && navItems.length > 0 && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {role.charAt(0).toUpperCase() + role.slice(1)} Meny
            </h2>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Services */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Tjenester
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/select-services"
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
              <span>Velg tjenester</span>
            </NavLink>
            
            <NavLink
              to="/power-comparison"
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
              <span>Strøm</span>
            </NavLink>
          </div>
        </div>
        
        {/* Leads section for authenticated users */}
        {isAuthenticated && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Forespørsler
            </h2>
            <div className="space-y-1">
              <NavLink
                to="/leads"
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
                <span>Forespørsler</span>
              </NavLink>
              
              <NavLink
                to="/leads/kanban"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Kanban size={16} />
                <span>Kanban-tavle</span>
              </NavLink>
            </div>
          </div>
        )}
        
        {/* Admin section */}
        {isAuthenticated && (role === 'admin' || role === 'master_admin') && (
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
              
              {role === 'master_admin' && (
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
        )}
        
        {/* Documentation section */}
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
        
        {/* Partners section */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Partnere
          </h2>
          <div className="space-y-1">
            <NavLink
              to="/companies"
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
              <span>Våre partnere</span>
            </NavLink>
          </div>
        </div>
        
        {/* Logout for authenticated users */}
        {isAuthenticated && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Konto
            </h2>
            <div className="space-y-1">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <LogOut size={16} />
                <span>Logg ut</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Render any children passed to the component */}
        {children}
      </div>
    </div>
  );
};

export default LayoutSidebar;
