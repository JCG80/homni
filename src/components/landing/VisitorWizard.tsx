import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { RoleToggle } from './RoleToggle';
import { EnhancedServiceSelection } from './enhanced/EnhancedServiceSelection';
import { LocationContextStep } from './LocationContextStep';
import { ContactStep } from './ContactStep';
import { WizardCompletionSummary } from './enhanced/WizardCompletionSummary';
import { EnhancedProgressIndicator } from './enhanced/EnhancedProgressIndicator';
import { useWizardProgress } from '@/hooks/useWizardProgress';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { createAnonymousLead } from '@/lib/leads/anonymousLead';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { WizardRole, WizardFormData } from '@/types/wizard-types';

interface VisitorWizardProps {
  className?: string;
}


export const VisitorWizard = ({ className }: VisitorWizardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  
  const { 
    formData, 
    currentStep, 
    setCurrentStep, 
    updateFormData, 
    clearProgress, 
    hasRestoredProgress 
  } = useWizardProgress();
  
  const { 
    trackEvent, 
    trackStepPerformance, 
    trackFormValidationError,
    trackDropoff,
    trackConversionFunnel 
  } = useEnhancedAnalytics();

  // Track step views and performance
  useEffect(() => {
    setStepStartTime(Date.now());
    trackEvent('visitor_step_view', { step: currentStep, role: formData.role });
    
    // Start conversion funnel tracking
    if (currentStep === 1) {
      trackConversionFunnel(formData.role, formData.service);
    }
  }, [currentStep, formData.role, trackEvent, trackConversionFunnel]);

  const totalSteps = 4;

  const handleRoleChange = (role: WizardRole) => {
    updateFormData({ role });
    localStorage.setItem('visitor_role', role);
    trackEvent('visitor_role_selected', { role });
    setValidationErrors([]); // Clear errors when role changes
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!formData.service) errors.push('Velg en tjeneste');
        break;
      case 2:
        if (!formData.postalCode) errors.push('Postnummer er påkrevd');
        if (!formData.propertyType) errors.push('Velg eiendomstype');
        break;
      case 3:
        if (!formData.name) errors.push('Navn er påkrevd');
        if (!formData.email) errors.push('E-post er påkrevd');
        if (!formData.phone) errors.push('Telefon er påkrevd');
        if (!formData.consent) errors.push('Du må samtykke for å fortsette');
        break;
    }
    
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      errors.forEach(error => trackFormValidationError(currentStep, 'general', error));
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      toast.error('Vennligst fyll ut alle påkrevde felt');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setValidationErrors([]);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
    }
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

      // Redirect to thank you page with params
      const params = new URLSearchParams({
        category: formData.service,
        leadId: lead.id
      });
      window.location.href = `/takk?${params.toString()}`;
      
      toast.success('Forespørsel sendt! Vi kontakter deg snart.');
    } catch (error) {
      logger.error('Error submitting lead', { error, formData: { ...formData, email: '[REDACTED]', phone: '[REDACTED]' } });
      toast.error('Noe gikk galt. Prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: return formData.service !== '';
      case 2: return formData.postalCode !== '' && formData.propertyType !== '';
      case 3: return formData.name !== '' && formData.email !== '' && formData.consent;
      default: return false;
    }
  };

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

      {/* Enhanced Progress Indicator */}
      <EnhancedProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        hasErrors={validationErrors.length > 0}
        estimatedTimeRemaining={currentStep < 4 ? (4 - currentStep) * 120 : 0} // 2 min per step
        hasRestoredProgress={hasRestoredProgress}
      />

      {/* Step Content */}
      <Card className="p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <EnhancedServiceSelection
                role={formData.role}
                selectedService={formData.service}
                onServiceSelect={(service) => {
                  updateFormData({ service });
                  trackEvent('visitor_product_selected', { product: service, role: formData.role });
                  setValidationErrors([]); // Clear errors when service is selected
                }}
              />
            )}

            {currentStep === 2 && (
              <LocationContextStep
                role={formData.role}
                service={formData.service}
                formData={formData}
                onDataChange={updateFormData}
              />
            )}

            {currentStep === 3 && (
              <ContactStep
                role={formData.role}
                formData={formData}
                onDataChange={updateFormData}
              />
            )}

            {currentStep === 4 && (
              <WizardCompletionSummary
                formData={formData}
                leadId={submittedLeadId}
                onNewRequest={() => {
                  clearProgress();
                  setCurrentStep(1);
                  setSubmittedLeadId(null);
                  setValidationErrors([]);
                }}
                onViewDashboard={() => window.location.href = '/dashboard'}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Tilbake
              </Button>
              
              {hasRestoredProgress && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearProgress}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Save className="w-3 h-3" />
                  Start på nytt
                </Button>
              )}
            </div>

            <Button
              onClick={currentStep === 3 ? handleSubmit : handleNextStep}
              disabled={isSubmitting}
              size="lg"
              className="flex items-center gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Sender...
                </div>
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