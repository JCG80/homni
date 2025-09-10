
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/normalizeRole';
import { Users, Building, Settings, LayoutGrid, Shield, DatabaseIcon } from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const { role } = useAuth();
  
  return (
    <nav className="mb-8">
      <ul className="flex flex-wrap gap-4 border-b pb-2">
        <li>
          <NavLink 
            to="/admin/leads" 
            className={({isActive}) => 
              isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
            }
          >
            <LayoutGrid className="h-4 w-4" />
            Leads
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/system-modules" 
            className={({isActive}) => 
              isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
            }
          >
            <DatabaseIcon className="h-4 w-4" />
            Systemmoduler
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/settings" 
            className={({isActive}) => 
              isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
            }
          >
            <Settings className="h-4 w-4" />
            Innstillinger
          </NavLink>
        </li>
        {role === 'master_admin' && (
          <>
            <li>
              <NavLink 
                to="/admin/roles" 
                className={({isActive}) => 
                  isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
                }
              >
                <Shield className="h-4 w-4" />
                Rolleadministrasjon
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/members" 
                className={({isActive}) => 
                  isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
                }
              >
                <Users className="h-4 w-4" />
                Medlemmer
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/companies" 
                className={({isActive}) => 
                  isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
                }
              >
                <Building className="h-4 w-4" />
                Bedrifter
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/internal-access" 
                className={({isActive}) => 
                  isActive ? "font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-1" : "text-muted-foreground hover:text-foreground flex items-center gap-1"
                }
              >
                <Shield className="h-4 w-4" />
                Modultilgang
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
