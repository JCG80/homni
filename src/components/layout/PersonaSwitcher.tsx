import React from 'react';
import { ChevronDown, Shield, User, Building2, Edit3, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/types/auth';
import { ProfileSwitcher } from '@/components/profile/ProfileSwitcher';

const roleIcons = {
  guest: User,
  user: User,
  company: Building2,
  content_editor: Edit3,
  admin: Shield,
  master_admin: Crown,
};

const roleLabels = {
  guest: 'Gjest',
  user: 'Bruker',
  company: 'Bedrift',
  content_editor: 'Innholdsredaktør',
  admin: 'Administrator',
  master_admin: 'Master Admin',
};

interface PersonaSwitcherProps {
  className?: string;
}

export function PersonaSwitcher({ className }: PersonaSwitcherProps) {
  const { role, user, isLoading } = useAuth();
  
  // For now, return null if not authenticated or no role
  if (isLoading || !user || !role) {
    return null;
  }

  const currentRole = role as UserRole;
  const Icon = roleIcons[currentRole] || User;
  const isAdminMode = ['admin', 'master_admin'].includes(currentRole);

  // Show ProfileSwitcher for admins
  if (isAdminMode) {
    return <ProfileSwitcher className={className} />;
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 h-8 px-2"
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{roleLabels[currentRole]}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
          <DropdownMenuLabel>Aktiv rolle</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{roleLabels[currentRole]}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Aktiv
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}