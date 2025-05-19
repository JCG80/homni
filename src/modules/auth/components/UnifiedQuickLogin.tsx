
import React from 'react';
import { Button } from '@/components/ui/button';
import { setupTestUsers } from '../utils/setupTestUsers';
import { UserRole } from '../utils/roles/types';
import { toast } from '@/hooks/use-toast';

interface QuickLoginProps {
  redirectTo?: string;
}

export const UnifiedQuickLogin: React.FC<QuickLoginProps> = ({ redirectTo }) => {
  if (import.meta.env.MODE !== 'development') {
    return null; // Only show in development mode
  }

  const handleLogin = async (role: UserRole) => {
    try {
      toast({
        title: "Quick Login",
        description: `Logging in as ${role}...`,
        variant: "default"
      });
      
      await setupTestUsers(role);
      
      // Redirect is handled by setupTestUsers through page reload
    } catch (error) {
      console.error('Error in quick login:', error);
      toast({
        title: "Quick Login Failed",
        description: `Could not login as ${role}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium mb-2 text-muted-foreground">Quick Login (Dev Only)</p>
      <div className="grid grid-cols-2 gap-2">
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-8"
          onClick={() => handleLogin('member')}
        >
          Member
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-8"
          onClick={() => handleLogin('company')}
        >
          Company
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-8"
          onClick={() => handleLogin('admin')}
        >
          Admin
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-8"
          onClick={() => handleLogin('master_admin')}
        >
          Master Admin
        </Button>
      </div>
    </div>
  );
};
