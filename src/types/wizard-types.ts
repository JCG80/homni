/**
 * Wizard-specific types - separate from auth system types
 */

export type WizardRole = 'private' | 'business';

export interface WizardFormData {
  role: WizardRole;
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