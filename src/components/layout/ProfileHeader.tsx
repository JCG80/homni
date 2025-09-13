
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, Building2, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@/modules/auth/api';
import { getRoleIcon, getRoleLabel } from '@/modules/auth/utils/shared/roleDisplay';
import { UserRole } from '@/modules/auth/normalizeRole';
import { useRoleContext } from '@/contexts/RoleContext';
import { useDevAuth } from '@/modules/auth/hooks/useDevAuth';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  showFullProfile?: boolean;
  className?: string;
}

export const ProfileHeader = ({ showFullProfile = false, className = '' }: ProfileHeaderProps) => {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();
  const { roles, activeMode, setActiveMode, isSwitching, error } = useRoleContext();
  const { isDevMode, devUserKey, switchToDevUser } = useDevAuth();
  
  // Get available roles and modes from profile metadata
  const availableRoles = profile?.metadata?.roles || [];
  const allowedModes = profile?.metadata?.allowed_modes || ['personal'];
  const primaryUserEmail = profile?.metadata?.primary_user_email;
  
  // Import dev users synchronously
  const getDevUsers = () => {
    if (!isDevMode) return {};
    try {
      const { DEV_USERS } = require('@/modules/auth/utils/devProfiles');
      return DEV_USERS;
    } catch {
      return {};
    }
  };
  const devUsers = getDevUsers();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'master_admin': return 'bg-red-500';
      case 'admin': return 'bg-orange-500';
      case 'company': return 'bg-blue-500';
      case 'user': return 'bg-green-500';
      case 'content_editor': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleModeSwitch = async (mode: 'personal' | 'professional') => {
    if (mode !== activeMode && !isSwitching) {
      await setActiveMode(mode);
    }
  };

  // Determine if user can switch modes based on metadata
  const hasProfessional = allowedModes.includes('professional') || availableRoles.includes('company') || role === 'admin' || role === 'master_admin';
  const canSwitchModes = allowedModes.length > 1 || availableRoles.length > 1;

  if (!user || !profile) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showFullProfile && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {role === 'company' ? (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant="secondary" className={getRoleColor(role || 'user')}>
              {getRoleLabel((role || 'user') as UserRole)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name || 'User'} />
              <AvatarFallback>
                {getInitials(profile.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="w-fit mt-1">
                {getRoleLabel(role as UserRole)}
              </Badge>
            </div>
          </DropdownMenuLabel>

          {/* Profile/Mode Switching Section */}
          {canSwitchModes && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                BYTT PROFIL
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => handleModeSwitch('personal')}
                disabled={isSwitching}
                className={cn(
                  "cursor-pointer",
                  activeMode === 'personal' && "bg-accent text-accent-foreground"
                )}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm">Privat</span>
                  <span className="text-xs text-muted-foreground">Personlige eiendommer</span>
                </div>
                {activeMode === 'personal' && <div className="w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
              
              {hasProfessional && (
                <DropdownMenuItem 
                  onClick={() => handleModeSwitch('professional')}
                  disabled={isSwitching}
                  className={cn(
                    "cursor-pointer",
                    activeMode === 'professional' && "bg-accent text-accent-foreground"
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm">Bedrift</span>
                    <span className="text-xs text-muted-foreground">Bedriftskonto og leads</span>
                  </div>
                  {activeMode === 'professional' && <div className="w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
              )}

              {(role === 'master_admin') && (
                <DropdownMenuItem 
                  onClick={() => navigate('/admin')}
                  className="cursor-pointer"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm">Master Admin</span>
                    <span className="text-xs text-muted-foreground">Full systemtilgang</span>
                  </div>
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Dev Profile Switching */}
          {isDevMode && Object.keys(devUsers).length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
                DEV PROFILER
              </DropdownMenuLabel>
              {Object.entries(devUsers).map(([key, devUser]: [string, any]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => switchToDevUser(key)}
                  className={cn(
                    "cursor-pointer",
                    devUserKey === key && "bg-accent text-accent-foreground"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm">{devUser.name}</span>
                    <span className="text-xs text-muted-foreground">{devUser.role}</span>
                  </div>
                  {devUserKey === key && <div className="w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Account Actions */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Min profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/account')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Innstillinger</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logg ut</span>
          </DropdownMenuItem>

          {/* Error Display */}
          {error && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-destructive">
                {error}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
