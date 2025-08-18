import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building } from 'lucide-react';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

export const ModeSwitcher: React.FC = () => {
  const { 
    activeMode, 
    setActiveMode, 
    isSwitching, 
    canSwitchToProfessional,
    isAuthenticated 
  } = useIntegratedAuth();

  if (!isAuthenticated) return null;

  const handleModeChange = async (newMode: 'personal' | 'professional') => {
    if (newMode !== activeMode) {
      await setActiveMode(newMode);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeMode}
        onValueChange={handleModeChange}
        disabled={isSwitching}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center gap-2">
            {activeMode === 'personal' ? (
              <User className="h-4 w-4" />
            ) : (
              <Building className="h-4 w-4" />
            )}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Privat
            </div>
          </SelectItem>
          {canSwitchToProfessional && (
            <SelectItem value="professional">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bedrift
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {isSwitching && (
        <div className="text-sm text-muted-foreground">
          Bytter modus...
        </div>
      )}
    </div>
  );
};