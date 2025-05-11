
import React, { useState } from 'react';
import { BusinessRegistrationForm } from './forms/BusinessRegistrationForm';
import { PrivateRegistrationForm } from './forms/PrivateRegistrationForm';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const RegisterForm = ({ 
  onSuccess, 
  redirectTo = '/', 
  userType = 'private' 
}: RegisterFormProps) => {
  // Add state to track registration progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const maxRetries = 3;

  // Common registration handler with retry logic
  const handleRegistration = async (submitFn: () => Promise<any>) => {
    setIsSubmitting(true);
    setCurrentAttempt(prev => prev + 1);
    
    try {
      await submitFn();
      // Reset counters on success
      setCurrentAttempt(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Registration attempt ${currentAttempt} failed:`, error);
      
      if (currentAttempt < maxRetries) {
        // Retry with exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, currentAttempt), 8000);
        setTimeout(() => handleRegistration(submitFn), backoffTime);
      } else {
        // Log final failure after retries
        console.error(`Registration failed after ${maxRetries} attempts`);
        setCurrentAttempt(0);
      }
    } finally {
      setIsSubmitting(false);
    }
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
