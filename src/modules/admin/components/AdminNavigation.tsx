
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserRole } from '@/modules/auth/utils/roles/types';

export const AdminNavigation: React.FC = () => {
  const { role } = useAuth();
  
  return (
    <nav className="mb-8">
      <ul className="flex flex-wrap gap-4 border-b pb-2">
        <li>
          <NavLink 
            to="/admin/leads" 
            className={({isActive}) => 
              isActive ? "font-medium text-primary border-b-2 border-primary pb-2" : "text-muted-foreground hover:text-foreground"
            }
          >
            Leads
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/settings" 
            className={({isActive}) => 
              isActive ? "font-medium text-primary border-b-2 border-primary pb-2" : "text-muted-foreground hover:text-foreground"
            }
          >
            Innstillinger
          </NavLink>
        </li>
        {role === 'master_admin' && (
          <li>
            <NavLink 
              to="/admin/roles" 
              className={({isActive}) => 
                isActive ? "font-medium text-primary border-b-2 border-primary pb-2" : "text-muted-foreground hover:text-foreground"
              }
            >
              Rolleadministrasjon
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
