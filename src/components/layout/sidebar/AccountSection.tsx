
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AccountSectionProps {
  onLogout: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ onLogout }) => {
  return (
    <div className="px-3 py-2 mt-auto">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Konto
      </h2>
      <div className="space-y-1">
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
          <User size={16} />
          <span>Min profil</span>
        </NavLink>
        
        <NavLink
          to="/account"
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
          <span>Innstillinger</span>
        </NavLink>
        
        <Button 
          onClick={onLogout}
          variant="ghost" 
          className="w-full justify-start px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logg ut
        </Button>
      </div>
    </div>
  );
};
