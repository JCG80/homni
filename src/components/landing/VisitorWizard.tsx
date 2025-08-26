import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { RoleToggle } from './RoleToggle';
import { ServiceSelectionStep } from './ServiceSelectionStep';
import { LocationContextStep } from './LocationContextStep';
import { ContactStep } from './ContactStep';
import { SuccessStep } from './SuccessStep';
import { createAnonymousLead } from '@/lib/leads/anonymousLead';
import { useVisitorAnalytics } from '@/lib/analytics/visitorAnalytics';
import { toast } from 'sonner';

export type UserRole = 'private' | 'business';

interface VisitorWizardProps {
  className?: string;
}

interface FormData {
  role: UserRole;
  service: string;
  postalCode: string;
  propertyType: string;
  propertyAge?: string;
  propertyCondition?: string;
  specialNeeds?: string[];
  consumption?: string;
  employees?: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  consent: boolean;
}

export const VisitorWizard = ({ className }: VisitorWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    role: 'private',
    service: '',
    postalCode: '',
    propertyType: '',
    name: '',
    email: '',
    phone: '',
    consent: false,
  });

  const { trackEvent } = useVisitorAnalytics();

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('visitor_role') as UserRole;
    if (savedRole && (savedRole === 'private' || savedRole === 'business')) {
      setFormData(prev => ({ ...prev, role: savedRole }));
    }
  }, []);

  // Track step views
  useEffect(() => {
    trackEvent('visitor_step_view', { step: currentStep, role: formData.role });
  }, [currentStep, formData.role, trackEvent]);

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    localStorage.setItem('visitor_role', role);
    trackEvent('visitor_role_selected', { role });
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const leadData = {
        title: `${formData.service} inquiry from ${formData.name}`,
        description: `${formData.role === 'business' ? 'Business' : 'Private'} customer interested in ${formData.service}`,
        category: formData.service,
        metadata: {
          role: formData.role,
          service: formData.service,
          postalCode: formData.postalCode,
          propertyType: formData.propertyType,
          consumption: formData.consumption,
          employees: formData.employees,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          source: 'visitor_wizard'
        }
      };

      const lead = await createAnonymousLead(leadData);
      setSubmittedLeadId(lead.id);
      
      trackEvent('visitor_lead_submitted', { 
        role: formData.role, 
        product: formData.service,
        postnr: formData.postalCode 
      });

      handleNextStep(); // Move to success step
      toast.success('Forespørsel sendt! Vi kontakter deg snart.');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Noe gikk galt. Prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: return formData.service !== '';
      case 2: return formData.postalCode !== '' && formData.propertyType !== '';
      case 3: return formData.name !== '' && formData.email !== '' && formData.consent;
      default: return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Header with Role Toggle */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {formData.role === 'business' 
            ? <>Spar penger på <span className="text-primary">bedriftens eiendom</span></>
            : <>Forbedre boligen og <span className="text-primary">spar penger</span></>
          }
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {formData.role === 'business'
            ? 'Få tilbud på tjenester som reduserer kostnader og øker verdien'
            : 'Få tilbud fra kvalitetsleverandører på 3 enkle steg'
          }
        </p>
        
        <RoleToggle 
          selectedRole={formData.role} 
          onRoleChange={handleRoleChange}
        />
      </div>

      {/* Progress Indicator */}
      <div className="mb-8" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {currentStep > step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div className={`
                  w-16 h-1 mx-2 transition-colors
                  ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-center mt-2">
          <span className="text-sm text-muted-foreground">
            Steg {currentStep} av {totalSteps}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <ServiceSelectionStep
                role={formData.role}
                selectedService={formData.service}
                onServiceSelect={(service) => {
                  updateFormData({ service });
                  trackEvent('visitor_product_selected', { product: service, role: formData.role });
                }}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <LocationContextStep
                role={formData.role}
                service={formData.service}
                formData={formData}
                onDataChange={updateFormData}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <ContactStep
                role={formData.role}
                formData={formData}
                onDataChange={updateFormData}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <SuccessStep
                role={formData.role}
                email={formData.email}
                leadId={submittedLeadId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Tilbake
            </Button>

            <Button
              onClick={currentStep === 3 ? handleSubmit : handleNextStep}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                'Sender...'
              ) : currentStep === 3 ? (
                'Send forespørsel'
              ) : (
                <>
                  Neste
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};