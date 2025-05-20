
import React, { useState, useEffect } from 'react';
import { BusinessRegistrationForm } from './forms/BusinessRegistrationForm';
import { PrivateRegistrationForm } from './forms/PrivateRegistrationForm';
import { useAuthRetry } from '../hooks/useAuthRetry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
  showTabs?: boolean;
}

export const RegisterForm = ({ 
  onSuccess, 
  redirectTo = '/dashboard', 
  userType: initialUserType = 'private',
  showTabs = true
}: RegisterFormProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  
  // Initialize activeTab from URL param or prop
  const [activeTab, setActiveTab] = useState<'private' | 'business'>(
    typeParam === 'business' ? 'business' : initialUserType
  );
  
  // Use our authRetry hook for registration
  const { isSubmitting, currentAttempt, maxRetries, executeWithRetry } = useAuthRetry({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    onSuccess,
    showToasts: true
  });

  // Update URL when tab changes (only if showTabs is true)
  useEffect(() => {
    if (showTabs && typeParam !== activeTab && activeTab === 'business') {
      setSearchParams({ type: 'business' });
    } else if (showTabs && typeParam && activeTab === 'private') {
      setSearchParams({});
    }
  }, [activeTab, typeParam, setSearchParams, showTabs]);

  // Common registration handler using our retry hook
  const handleRegistration = async (submitFn: () => Promise<any>) => {
    await executeWithRetry(submitFn);
  };

  // Toggle between private and business registration
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'private' | 'business');
  };

  const renderForm = () => {
    if (activeTab === 'private') {
      return (
        <PrivateRegistrationForm 
          onSuccess={onSuccess} 
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          retryHandler={handleRegistration}
          currentAttempt={currentAttempt}
          maxRetries={maxRetries}
        />
      );
    }
    
    return (
      <BusinessRegistrationForm 
        onSuccess={onSuccess} 
        redirectTo={redirectTo} 
        isSubmitting={isSubmitting}
        retryHandler={handleRegistration}
        currentAttempt={currentAttempt}
        maxRetries={maxRetries}
      />
    );
  };

  return (
    <div className="space-y-6">
      {showTabs ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="private">Privatperson</TabsTrigger>
            <TabsTrigger value="business">Bedrift</TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="space-y-4">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="business" className="space-y-4">
            {renderForm()}
          </TabsContent>
        </Tabs>
      ) : (
        renderForm()
      )}
    </div>
  );
};
