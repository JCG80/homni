import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ContactStep } from './steps/ContactStep';
import { ServiceDetailsStep } from './steps/ServiceDetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { insertLead } from '../../api/lead-create';
import { validateLeadData } from '../../utils/leadValidation';
import { suggestCategories } from '../../utils/categoryService';

export interface LeadWizardData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  budget_range?: string;
  
  // Contact
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  preferred_contact: 'email' | 'phone' | 'sms';
  best_time: string;
  
  // Service Details
  service_type: string;
  property_type?: string;
  property_address?: string;
  project_timeline?: string;
  additional_info?: string;
  
  // Auto-suggested fields
  suggested_categories?: string[];
  lead_score?: number;
}

const STEPS = [
  { id: 1, title: 'Grunninfo', description: 'Hva trenger du hjelp med?' },
  { id: 2, title: 'Kontakt', description: 'Hvordan kan vi nå deg?' },
  { id: 3, title: 'Detaljer', description: 'Fortell oss mer' },
  { id: 4, title: 'Bekreft', description: 'Se over før sending' }
];

interface SmartLeadWizardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SmartLeadWizard: React.FC<SmartLeadWizardProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadWizardData>({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    customer_name: '',
    customer_email: '',
    preferred_contact: 'email',
    best_time: 'anytime',
    service_type: '',
  });
  const [validation, setValidation] = useState<Record<string, string>>({});

  // Auto-suggest categories when description changes
  useEffect(() => {
    if (formData.description.length > 20) {
      const debounceTimer = setTimeout(async () => {
        try {
          const suggestions = await suggestCategories(formData.description);
          setFormData(prev => ({
            ...prev,
            suggested_categories: suggestions
          }));
        } catch (error) {
          console.error('Category suggestion failed:', error);
        }
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [formData.description]);

  const updateFormData = (updates: Partial<LeadWizardData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setValidation(prev => {
      const newValidation = { ...prev };
      updatedFields.forEach(field => delete newValidation[field]);
      return newValidation;
    });
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const errors = await validateLeadData(formData, step);
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before continuing",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await insertLead({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        service_type: formData.service_type,
        metadata: {
          urgency: formData.urgency,
          budget_range: formData.budget_range,
          preferred_contact: formData.preferred_contact,
          best_time: formData.best_time,
          property_type: formData.property_type,
          property_address: formData.property_address,
          project_timeline: formData.project_timeline,
          additional_info: formData.additional_info,
          lead_score: formData.lead_score,
          capture_method: 'smart_wizard'
        }
      });

      toast({
        title: "Forespørsel sendt!",
        description: "Vi har mottatt din forespørsel og vil kontakte deg snart.",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Feil ved innsending",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            onChange={updateFormData}
            errors={validation}
          />
        );
      case 2:
        return (
          <ContactStep
            data={formData}
            onChange={updateFormData}
            errors={validation}
          />
        );
      case 3:
        return (
          <ServiceDetailsStep
            data={formData}
            onChange={updateFormData}
            errors={validation}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Smart Lead Capture</h1>
        <p className="text-muted-foreground">
          Vi guider deg gjennom prosessen for å finne riktig leverandør
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${
                currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 ${
                  currentStep >= step.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`} />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
          <p className="text-muted-foreground">
            {STEPS[currentStep - 1]?.description}
          </p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Avbryt' : 'Tilbake'}
        </Button>

        <div className="flex space-x-2">
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Neste
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Sender...' : 'Send forespørsel'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};