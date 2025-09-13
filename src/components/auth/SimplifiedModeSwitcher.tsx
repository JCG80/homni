import React from 'react';
import { Button } from '@/components/ui/button';
import { useRoleContext } from '@/contexts/RoleContext';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { routeForRole } from '@/config/routeForRole';
import { User, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Simplified mode switcher for regular users (personal ↔ professional)
 * This is NOT for admin role switching - that's handled separately in admin areas
 */
export const SimplifiedModeSwitcher: React.FC = () => {
  const { roles, activeMode, setActiveMode, isSwitching, isLoading, error } = useRoleContext();
  const { role } = useAuth();
  const navigate = useNavigate();
  
  if (isLoading) return null;

  // Only show if user has both personal and professional capabilities
  const hasProfessional = roles.includes('company') || roles.includes('buyer');
  if (!hasProfessional) return null;

  const modes = [
    { 
      key: 'personal' as const, 
      label: 'Privat', 
      icon: User,
      description: 'Personlige forespørsler og eiendommer'
    },
    { 
      key: 'professional' as const, 
      label: 'Bedrift', 
      icon: Building2,
      description: 'Bedriftskonto og kjøp av leads'
    }
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <span className="text-sm text-muted-foreground mr-2">Modus:</span>
      
      <div className="flex bg-background rounded-md p-1 relative">
        {modes.map((mode) => {
          const isActive = activeMode === mode.key;
          const Icon = mode.icon;
          
          return (
            <Button
              key={mode.key}
              variant="ghost"
              size="sm"
              disabled={isSwitching}
              onClick={async () => {
                await setActiveMode(mode.key);
                // Redirect to appropriate dashboard after mode switch
                if (role) {
                  const targetRole = mode.key === 'professional' ? 'company' : 'user';
                  const dashboardPath = routeForRole(targetRole);
                  navigate(dashboardPath, { replace: true });
                }
              }}
              className={cn(
                "relative z-10 flex items-center gap-2 px-3 py-1 text-sm transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {mode.label}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-primary/10 rounded-sm -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Button>
          );
        })}
      </div>

      {error && (
        <span className="text-xs text-destructive ml-2">
          {error}
        </span>
      )}
    </div>
  );
};