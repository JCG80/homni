
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
import { Settings, LogOut, User, Building2 } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@/modules/auth/api';
import { getRoleIcon, getRoleLabel } from '@/modules/auth/utils/shared/roleDisplay';
import { UserRole } from '@/modules/auth/normalizeRole';

interface ProfileHeaderProps {
  showFullProfile?: boolean;
  className?: string;
}

export const ProfileHeader = ({ showFullProfile = false, className = '' }: ProfileHeaderProps) => {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();

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
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="w-fit mt-1">
              {getRoleLabel(role as UserRole)}
            </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Innstillinger</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logg ut</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
