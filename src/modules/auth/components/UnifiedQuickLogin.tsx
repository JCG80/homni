import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setupTestUsers } from '../utils/setupTestUsers';
import { UserRole } from '../utils/roles/types';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export interface UnifiedQuickLoginProps {
  redirectTo?: string;
  onSuccess?: () => void;
  showHeader?: boolean;
}

const roles: { role: UserRole; label: string; color: string }[] = [
  { role: 'master_admin', label: 'Master Admin', color: 'text-purple-500' },
  { role: 'admin', label: 'Admin', color: 'text-blue-500' },
  { role: 'content_editor', label: 'Editor', color: 'text-green-500' },
  { role: 'company', label: 'Company', color: 'text-amber-500' },
  { role: 'member', label: 'Member', color: 'text-slate-500' },
  { role: 'anonymous', label: 'Guest', color: 'text-gray-400' },
];

export const UnifiedQuickLogin = ({ redirectTo, onSuccess, showHeader = true }: UnifiedQuickLoginProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('grid');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug info
    console.log('UnifiedQuickLogin mounted with redirectTo:', redirectTo);
  }, [redirectTo]);
  
  const handleLogin = async (role: UserRole) => {
    try {
      console.log(`Attempting quick login as ${role}`);
      setIsLoading(role);
      await setupTestUsers(role);
      
      // Handle success callback and redirection
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectTo) {
        navigate(redirectTo);
      }
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
    <Card>
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Developer Quick Login</CardTitle>
          <CardDescription>For testing purposes only</CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            <motion.div 
              className="grid grid-cols-3 gap-2" 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                },
                hidden: {}
              }}
            >
              {roles.map(({ role, label, color }) => (
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
                    className="w-full"
                    disabled={isLoading !== null}
                    onClick={() => handleLogin(role)}
                  >
                    {isLoading === role ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className={color}>{label}</span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="list">
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                },
                hidden: {}
              }}
            >
              {roles.map(({ role, label, color }) => (
                <motion.div 
                  key={role}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                  }}
                >
                  <Button
                    key={role}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    disabled={isLoading !== null}
                    onClick={() => handleLogin(role)}
                  >
                    {isLoading === role ? (
                      <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className={color}>{label}</span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
