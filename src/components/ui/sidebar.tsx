
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Settings, LayoutGrid, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from './button';

export const Sidebar = () => {
  const { isAuthenticated, role, user } = useAuth();
  
  const handleLogout = () => {
    // Vi bruker navigate til login siden som en fallback
    // Dette vil bli erstattet av en faktisk logout-funksjon når den er implementert
    window.location.href = '/login';
  };
  
  return (
    <div className="pb-12">
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
            
            <NavLink
              to="/strom"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <LayoutGrid size={16} />
              <span>Strøm</span>
            </NavLink>
            
            <NavLink
              to="/forsikring/companies"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <LayoutGrid size={16} />
              <span>Forsikring</span>
            </NavLink>
          </div>
        </div>

        {/* Authenticated menu items */}
        {isAuthenticated && (
          <>
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Min konto
              </h2>
              <div className="space-y-1">
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
                
                <NavLink
                  to="/profile"
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
                  <span>Min profil</span>
                </NavLink>
                
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
                  <LayoutGrid size={16} />
                  <span>Forespørsler</span>
                </NavLink>
              </div>
            </div>
            
            {/* Admin section */}
            {(role === 'admin' || role === 'master_admin') && (
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
                    <LayoutGrid size={16} />
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
                    <Settings size={16} />
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
                        <Users size={16} />
                        <span>Roller</span>
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
                        <span>Brukere</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Logout button */}
            <div className="px-3 py-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                <span>Logg ut</span>
              </Button>
            </div>
          </>
        )}

        {/* Documentation section */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-medium text-muted-foreground">
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
          </div>
        </div>
      </div>
    </div>
  );
};
