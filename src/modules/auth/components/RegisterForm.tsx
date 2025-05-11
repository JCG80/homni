
import React from 'react';
import { BusinessRegistrationForm } from './forms/BusinessRegistrationForm';
import { PrivateRegistrationForm } from './forms/PrivateRegistrationForm';
import { useAuthRetry } from '../hooks/useAuthRetry';

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

  // Pass the retry handler to the appropriate form based on user type
  return userType === 'business' ? (
    <BusinessRegistrationForm 
      onSuccess={onSuccess} 
      redirectTo={redirectTo} 
      isSubmitting={isSubmitting}
      retryHandler={handleRegistration}
      currentAttempt={currentAttempt}
      maxRetries={maxRetries}
    />
  ) : (
    <PrivateRegistrationForm 
      onSuccess={onSuccess} 
      redirectTo={redirectTo}
      isSubmitting={isSubmitting}
      retryHandler={handleRegistration}
      currentAttempt={currentAttempt}
      maxRetries={maxRetries}
    />
  );
};
