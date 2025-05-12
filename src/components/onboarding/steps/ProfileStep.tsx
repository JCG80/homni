
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserType } from '../OnboardingWizard';
import { Building2, User } from 'lucide-react';

interface ProfileStepProps {
  formData: {
    companyName?: string;
    phoneNumber?: string;
  };
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
  onFormChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProfileStep = ({ 
  formData, 
  userType, 
  onUserTypeChange, 
  onFormChange, 
  onNext, 
  onBack 
}: ProfileStepProps) => {
  
  // Schema for member
  const memberSchema = z.object({
    phoneNumber: z.string().optional(),
  });

  // Schema for company
  const companySchema = z.object({
    companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
    phoneNumber: z.string().optional(),
  });

  // Form for member
  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      phoneNumber: formData.phoneNumber || '',
    },
  });

  // Form for company
  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: formData.companyName || '',
      phoneNumber: formData.phoneNumber || '',
    },
  });

  const onMemberSubmit = (values: z.infer<typeof memberSchema>) => {
    if (values.phoneNumber) {
      onFormChange('phoneNumber', values.phoneNumber);
    }
    onNext();
  };

  const onCompanySubmit = (values: z.infer<typeof companySchema>) => {
    onFormChange('companyName', values.companyName);
    if (values.phoneNumber) {
      onFormChange('phoneNumber', values.phoneNumber);
    }
    onNext();
  };

  const handleTabChange = (value: string) => {
    onUserTypeChange(value as UserType);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Complete Your Profile</h2>
        <p className="text-muted-foreground mt-2">
          Choose your account type and complete your profile
        </p>
      </div>

      <Tabs value={userType} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="member" className="gap-2">
            <User className="h-4 w-4" /> Individual
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" /> Business
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="member">
          <Form {...memberForm}>
            <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
              <FormField
                control={memberForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+47 123 45 678" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onFormChange('phoneNumber', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="company">
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Acme Inc." 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onFormChange('companyName', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={companyForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+47 123 45 678" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onFormChange('phoneNumber', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
