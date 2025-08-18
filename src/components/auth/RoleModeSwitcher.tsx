import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

interface RoleModeSwitcherProps {
  className?: string;
  onModeChange?: (controlMode: boolean) => void;
}

/**
 * RoleModeSwitcher allows admin/master_admin users to toggle between
 * user interfaces (normal mode) and control plan interfaces (admin mode)
 */
export const RoleModeSwitcher: React.FC<RoleModeSwitcherProps> = ({
  className,
  onModeChange
}) => {
  const { role } = useAuth();
  const [controlMode, setControlMode] = useState(false);

  // Only admin and master_admin can switch to control mode
  const canSwitchToControl = role === 'admin' || role === 'master_admin';

  // Hide switcher if user doesn't have admin permissions
  if (!canSwitchToControl) {
    return null;
  }

  const handleModeToggle = (checked: boolean) => {
    setControlMode(checked);
    onModeChange?.(checked);
  };

  return (
    <div className={cn(
      "flex items-center space-x-3 p-3 rounded-lg border bg-card",
      className
    )}>
      <div className="flex items-center space-x-2">
        <User 
          className={cn(
            "h-4 w-4 transition-colors",
            !controlMode ? "text-primary" : "text-muted-foreground"
          )} 
        />
        <Label 
          htmlFor="mode-switcher" 
          className={cn(
            "text-sm font-medium cursor-pointer transition-colors",
            !controlMode ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Bruker-modus
        </Label>
      </div>

      <Switch
        id="mode-switcher"
        checked={controlMode}
        onCheckedChange={handleModeToggle}
        aria-label="Bytt mellom bruker-modus og kontrollplan"
      />

      <div className="flex items-center space-x-2">
        <Label 
          htmlFor="mode-switcher" 
          className={cn(
            "text-sm font-medium cursor-pointer transition-colors",
            controlMode ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Kontrollplan
        </Label>
        <Shield 
          className={cn(
            "h-4 w-4 transition-colors",
            controlMode ? "text-primary" : "text-muted-foreground"
          )} 
        />
      </div>

      {controlMode && (
        <div className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
          {role === 'master_admin' ? 'Master Admin' : 'Admin'}
        </div>
      )}
    </div>
  );
};

export default RoleModeSwitcher;