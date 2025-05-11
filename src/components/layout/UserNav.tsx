
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DevProfileSwitcher } from '@/modules/auth/components/DevProfileSwitcher';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserNav() {
  const { 
    user, 
    profile, 
    isDevMode, 
    switchDevUser, 
    role 
  } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    // This would be handled by your auth logout function
    // Placeholder for now
    navigate('/login');
  };

  // Function to get initials from name
  const getInitials = () => {
    if (profile?.metadata?.initials) {
      return profile.metadata.initials;
    }
    
    if (!profile?.full_name) {
      return user?.email?.substring(0, 2).toUpperCase() || 'U';
    }
    
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get user role display name
  const getRoleDisplay = () => {
    switch (role) {
      case 'master_admin':
        return 'Master Admin';
      case 'admin':
        return 'Administrator';
      case 'company':
      case 'business':
        return 'Company';
      case 'member':
      case 'user':
        return 'User';
      default:
        return role || 'Guest';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Show dev profile switcher only in development mode */}
      {isDevMode && switchDevUser && (
        <DevProfileSwitcher
          currentKey={profile?.metadata?.devKey || null}
          onSwitchUser={(newProfile) => switchDevUser(newProfile.id)}
        />
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials()}
                      {isDevMode && <Check className="absolute bottom-0 right-0 h-3 w-3 text-green-600" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Bruker'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isDevMode && role && (
                      <p className="text-xs font-semibold text-primary">
                        Role: {getRoleDisplay()}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Min profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-account')}>
                  Min konto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Du er logget inn som: {getRoleDisplay()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
