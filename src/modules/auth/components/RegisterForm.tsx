
import React, { useState } from 'react';
import { BusinessRegistrationForm } from './forms/BusinessRegistrationForm';
import { PrivateRegistrationForm } from './forms/PrivateRegistrationForm';
import { useAuthRetry } from '../hooks/useAuthRetry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const RegisterForm = ({ 
  onSuccess, 
  redirectTo = '/dashboard', 
  userType = 'private' 
}: RegisterFormProps) => {
  const [activeTab, setActiveTab] = useState<'private' | 'business'>(userType);
  
  // Use our authRetry hook for registration
  const { isSubmitting, currentAttempt, maxRetries, executeWithRetry } = useAuthRetry({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    onSuccess,
    showToasts: true
  });

  // Common registration handler using our retry hook
  const handleRegistration = async (submitFn: () => Promise<any>) => {
    await executeWithRetry(submitFn);
  };

  // Toggle between private and business registration
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'private' | 'business');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="private">Privatperson</TabsTrigger>
          <TabsTrigger value="business">Bedrift</TabsTrigger>
        </TabsList>
        
        <TabsContent value="private" className="space-y-4">
          <PrivateRegistrationForm 
            onSuccess={onSuccess} 
            redirectTo={redirectTo}
            isSubmitting={isSubmitting}
            retryHandler={handleRegistration}
            currentAttempt={currentAttempt}
            maxRetries={maxRetries}
          />
        </TabsContent>
        
        <TabsContent value="business" className="space-y-4">
          <BusinessRegistrationForm 
            onSuccess={onSuccess} 
            redirectTo={redirectTo} 
            isSubmitting={isSubmitting}
            retryHandler={handleRegistration}
            currentAttempt={currentAttempt}
            maxRetries={maxRetries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
