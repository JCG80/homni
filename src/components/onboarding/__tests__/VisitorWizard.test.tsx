/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VisitorWizard } from '../../../components/landing/VisitorWizard';
import * as anonymousLead from '@/lib/leads/anonymousLead';

// Mock dependencies
vi.mock('@/lib/leads/anonymousLead');
vi.mock('@/hooks/useWizardProgress');
vi.mock('@/hooks/useEnhancedAnalytics');
vi.mock('@/utils/logger');
vi.mock('sonner');

const mockCreateAnonymousLead = vi.mocked(anonymousLead.createAnonymousLead);

const mockUseWizardProgress = {
  formData: {
    role: 'private' as const,
    service: '',
    postalCode: '',
    propertyType: '',
    name: '',
    email: '',
    phone: '',
    consent: false
  },
  currentStep: 1,
  setCurrentStep: vi.fn(),
  updateFormData: vi.fn(),
  clearProgress: vi.fn(),
  hasRestoredProgress: false
};

const mockUseEnhancedAnalytics = {
  trackEvent: vi.fn(),
  trackStepPerformance: vi.fn(),
  trackFormValidationError: vi.fn(),
  trackDropoff: vi.fn(),
  trackConversionFunnel: vi.fn()
};

vi.mock('@/hooks/useWizardProgress', () => ({
  useWizardProgress: () => mockUseWizardProgress
}));

vi.mock('@/hooks/useEnhancedAnalytics', () => ({
  useEnhancedAnalytics: () => mockUseEnhancedAnalytics
}));

describe('VisitorWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAnonymousLead.mockResolvedValue({ 
      id: 'test-lead-id',
      distributed: true,
      assignedTo: 'company-1'
    });
  });

  it('renders the wizard with initial step', () => {
    render(<VisitorWizard />);
    
    expect(screen.getByText(/Forbedre boligen og/)).toBeInTheDocument();
    expect(screen.getByText(/Få tilbud fra kvalitetsleverandører/)).toBeInTheDocument();
  });

  it('displays role toggle and allows role switching', () => {
    render(<VisitorWizard />);
    
    // Should have role toggle buttons
    expect(screen.getByText('Privat')).toBeInTheDocument();
    expect(screen.getByText('Bedrift')).toBeInTheDocument();
  });

  it('tracks role selection event', () => {
    render(<VisitorWizard />);
    
    const businessToggle = screen.getByText('Bedrift');
    fireEvent.click(businessToggle);
    
    expect(mockUseWizardProgress.updateFormData).toHaveBeenCalledWith({ role: 'business' });
    expect(mockUseEnhancedAnalytics.trackEvent).toHaveBeenCalledWith('visitor_role_selected', { role: 'business' });
  });

  it('shows validation errors for incomplete steps', async () => {
    render(<VisitorWizard />);
    
    const nextButton = screen.getByText('Neste');
    fireEvent.click(nextButton);
    
    // Should track validation error
    expect(mockUseEnhancedAnalytics.trackFormValidationError).toHaveBeenCalled();
  });

  it('creates anonymous lead on form submission', async () => {
    // Mock complete form data
    const completeFormData = {
      ...mockUseWizardProgress.formData,
      service: 'strøm',
      postalCode: '0001',
      propertyType: 'house',
      name: 'Test User',
      email: 'test@example.com',
      phone: '12345678',
      consent: true
    };

    mockUseWizardProgress.formData = completeFormData;
    mockUseWizardProgress.currentStep = 3;

    render(<VisitorWizard />);
    
    const submitButton = screen.getByText('Send forespørsel');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateAnonymousLead).toHaveBeenCalledWith({
        title: 'strøm inquiry from Test User',
        description: 'Private customer interested in strøm',
        category: 'strøm',
        metadata: {
          role: 'private',
          service: 'strøm',
          postalCode: '0001',
          propertyType: 'house',
          name: 'Test User',
          email: 'test@example.com',
          phone: '12345678',
          source: 'visitor_wizard'
        }
      });
    });

    expect(mockUseEnhancedAnalytics.trackEvent).toHaveBeenCalledWith('visitor_lead_submitted', {
      role: 'private',
      product: 'strøm',
      postnr: '0001'
    });
  });

  it('handles lead creation errors gracefully', async () => {
    mockCreateAnonymousLead.mockRejectedValue(new Error('Network error'));
    
    const completeFormData = {
      ...mockUseWizardProgress.formData,
      service: 'strøm',
      postalCode: '0001',
      propertyType: 'house',
      name: 'Test User',
      email: 'test@example.com',
      phone: '12345678',
      consent: true
    };

    mockUseWizardProgress.formData = completeFormData;
    mockUseWizardProgress.currentStep = 3;

    render(<VisitorWizard />);
    
    const submitButton = screen.getByText('Send forespørsel');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateAnonymousLead).toHaveBeenCalled();
    });
    
    // Should handle error gracefully (toast error message would be shown)
  });

  it('tracks step views and performance', () => {
    render(<VisitorWizard />);
    
    expect(mockUseEnhancedAnalytics.trackEvent).toHaveBeenCalledWith('visitor_step_view', {
      step: 1,
      role: 'private'
    });
    
    expect(mockUseEnhancedAnalytics.trackConversionFunnel).toHaveBeenCalledWith('private', '');
  });
});