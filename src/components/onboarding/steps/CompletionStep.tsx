
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRegistrationSubmit } from '@/modules/auth/hooks/useRegistrationSubmit';
import { UserType } from '../OnboardingWizard';

interface CompletionStepProps {
  userType: UserType;
  formData: {
    email: string;
    password: string;
    fullName: string;
    companyName?: string;
    phoneNumber?: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

export const CompletionStep = ({ userType, formData, onComplete, onBack }: CompletionStepProps) => {
  const { handleSubmit, isSubmitting, error } = useRegistrationSubmit();
  
  const completeRegistration = async () => {
    // Map UserType (user/company) to registration API's expected format (private/business)
    const mappedUserType = userType === 'user' ? 'private' : 'business';
    
    // Create registration data object with the mapped user type
    const registrationData = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      companyName: formData.companyName,
      phoneNumber: formData.phoneNumber,
      userType: mappedUserType as 'private' | 'business',
      redirectTo: `/dashboard/${userType}`,
      onSuccess: onComplete,
    };
    
    // Pass the data object directly to handleSubmit
    await handleSubmit(registrationData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Almost Done!</h2>
        <p className="text-muted-foreground mt-2">
          Review your information and create your account
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Account Information</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Account Type:</div>
          <div className="font-medium capitalize">{userType}</div>
          
          <div className="text-muted-foreground">Name:</div>
          <div>{formData.fullName}</div>
          
          <div className="text-muted-foreground">Email:</div>
          <div>{formData.email}</div>
          
          {formData.phoneNumber && (
            <>
              <div className="text-muted-foreground">Phone:</div>
              <div>{formData.phoneNumber}</div>
            </>
          )}
          
          {userType === 'company' && formData.companyName && (
            <>
              <div className="text-muted-foreground">Company:</div>
              <div>{formData.companyName}</div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button 
          onClick={completeRegistration} 
          disabled={isSubmitting} 
          className="gap-2"
        >
          Create Account
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          {isSubmitting && (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          )}
        </Button>
      </div>
    </div>
  );
};
