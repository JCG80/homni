import { useState, useEffect } from 'react';
import { WizardFormData } from '@/types/wizard-types';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'visitor_wizard_progress';

export const useWizardProgress = () => {
  const [formData, setFormData] = useState<WizardFormData>({
    role: 'private',
    service: '',
    postalCode: '',
    propertyType: '',
    name: '',
    email: '',
    phone: '',
    consent: false,
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const { formData: saved, currentStep: savedStep } = JSON.parse(savedProgress);
        setFormData(saved);
        setCurrentStep(savedStep);
        setHasRestoredProgress(true);
      } catch (error) {
        logger.warn('Failed to restore wizard progress:', {
          module: 'useWizardProgress'
        }, error as Error);
      }
    }
  }, []);

  // Save progress on every change (debounced)
  useEffect(() => {
    if (!hasRestoredProgress && currentStep === 1 && !formData.service) {
      return; // Don't save initial empty state
    }
    
    const timeoutId = setTimeout(() => {
      const progressData = { formData, currentStep };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, hasRestoredProgress]);

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({
      role: 'private',
      service: '',
      postalCode: '',
      propertyType: '',
      name: '',
      email: '',
      phone: '',
      consent: false,
    });
    setCurrentStep(1);
  };

  return {
    formData,
    currentStep,
    setCurrentStep,
    updateFormData,
    clearProgress,
    hasRestoredProgress
  };
};