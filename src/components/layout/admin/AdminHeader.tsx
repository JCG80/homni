import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks';
import { Settings, Bell, User, Shield, LogOut } from 'lucide-react';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';
import { UpdateAppButton } from '@/components/debug/UpdateAppButton';
import { EnvProbe } from '@/components/debug/EnvProbe';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const AdminHeader: React.FC = () => {
  const { profile, logout, isMasterAdmin } = useAuth();

  const getInitials = () => {
    if (!profile?.full_name) return 'A';
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Admin Branding */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Homni Admin
            </span>
          </Link>
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            Kontrollpanel
          </Badge>
        </div>

        {/* Admin Tools */}
        <div className="flex items-center gap-4">
          {/* Role Preview Switcher */}
          <RoleSwitcher />
          
          {/* System Tools */}
          <UpdateAppButton />
          
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Admin Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-700">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isMasterAdmin ? 'Master Administrator' : 'Administrator'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Systeminnstillinger</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Min profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Environment Probe */}
      <EnvProbe />
    </header>
  );
};