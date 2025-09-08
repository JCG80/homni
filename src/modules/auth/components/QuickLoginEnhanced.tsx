
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setupTestUsers } from '../utils/setupTestUsers';
import { UserRole, normalizeRole } from '@/modules/auth/normalizeRole';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface QuickLoginProps {
  redirectTo?: string;
  showHeader?: boolean;
}

const roles: { role: UserRole; label: string; color: string }[] = [
  { role: 'master_admin', label: 'Master Admin', color: 'bg-purple-500 hover:bg-purple-600' },
  { role: 'admin', label: 'Admin', color: 'bg-blue-500 hover:bg-blue-600' },
  { role: 'content_editor', label: 'Content Editor', color: 'bg-green-500 hover:bg-green-600' },
  { role: 'company', label: 'Company', color: 'bg-amber-500 hover:bg-amber-600' },
  { role: 'user', label: 'User', color: 'bg-slate-500 hover:bg-slate-600' },
  { role: 'guest', label: 'Guest', color: 'bg-gray-400 hover:bg-gray-500' },
];

const staggerDelay = 0.05;

export const QuickLoginEnhanced = ({ redirectTo, showHeader = true }: QuickLoginProps) => {
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  
  const handleLogin = async (role: UserRole) => {
    try {
      setIsLoading(role);
      const normalizedRole = normalizeRole(role);
      await setupTestUsers(normalizedRole);
      // Note: setupTestUsers handles toast notifications internally
    } catch (error) {
      console.error('Failed to login with test user:', error);
      toast({
        title: 'Login Failed',
        description: `Could not login as ${role}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="border-dashed border-2">
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Login</CardTitle>
          <CardDescription>Development testing only</CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="pt-4">
        <motion.div 
          className="grid grid-cols-2 gap-2" 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: staggerDelay
              }
            },
            hidden: {}
          }}
        >
          {roles.map(({ role, label, color }, index) => (
            <motion.div 
              key={role}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
            >
              <Button
                key={role}
                size="sm"
                variant="outline"
                className={`w-full text-white ${color}`}
                disabled={isLoading !== null}
                onClick={() => handleLogin(role)}
              >
                {isLoading === role ? (
                  <span className="flex items-center space-x-1">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>...</span>
                  </span>
                ) : label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
