
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DevProfileSwitcher } from '@/modules/auth/components/DevProfileSwitcher';
import { Check, Users, Layers, ActivitySquare, Settings, LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function UserNav() {
  const { 
    user, 
    profile, 
    isDevMode, 
    switchDevUser, 
    role,
    logout,
    isAdmin,
    isMasterAdmin
  } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    if (logout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    } else {
      // Fallback for backwards compatibility
      navigate('/login');
    }
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
        return 'Company';
      case 'member':
        return 'User';
      case 'content_editor':
        return 'Content Editor';
      default:
        return role || 'Guest';
    }
  };

  const toggleDevMode = () => {
    // This function would need to be implemented in the Auth context
    if (typeof window !== 'undefined') {
      localStorage.setItem('devMode', isDevMode ? 'false' : 'true');
      window.location.reload();
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
                    {role && (
                      <p className="text-xs font-semibold text-primary">
                        Role: {getRoleDisplay()}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <ActivitySquare className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Users className="h-4 w-4 mr-2" />
                    Min profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-account')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Min konto
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                {(isAdmin || isMasterAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate('/admin/leads')}>
                        Admin Leads
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/feature-flags')}>
                        Feature Flags
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/system-modules')}>
                        System Modules
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
                
                {(isAdmin || isMasterAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Developer Tools</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center justify-between cursor-default">
                      <Label htmlFor="dev-mode" className="cursor-pointer">Dev Mode</Label>
                      <Switch 
                        id="dev-mode" 
                        checked={isDevMode} 
                        onCheckedChange={toggleDevMode}
                      />
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
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
