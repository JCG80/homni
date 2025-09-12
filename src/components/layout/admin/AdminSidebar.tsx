import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/hooks';
import { navControl } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSidebar: React.FC = () => {
  const { isMasterAdmin } = useAuth();
  const role: UserRole = isMasterAdmin ? 'master_admin' : 'admin';
  const navigationItems = navControl[role];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Back to User Area */}
      <div className="p-4 border-b border-slate-700">
        <Button 
          asChild 
          variant="ghost" 
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Link to="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Tilbake til brukerområde
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Systemadministrasjon
          </h2>
          
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )
                }
              >
                {IconComponent && typeof IconComponent === 'function' && <IconComponent className="h-4 w-4" />}
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <p>Homni Kontrollpanel</p>
          <p>v{process.env.REACT_APP_VERSION || '1.0.0'}</p>
        </div>
      </div>
    </div>
  );
};